
import { sendPriceDropAlert } from "@/lib/email";
import { scrapeProduct } from "@/lib/firecrawl";
import { createClient } from "@supabase/supabase-js";
import {NextResponse} from "next/server";

export async function POST(request){
    try{
        const authHeader = request.header.get("authorization");
        const cronSecret=process.env.CRON_SECRET;
        console.log(cronSecret)

        if(!cronSecret || authHeader!== `Bearer${cronSecret}`){
            return NextResponse.json({error:"Unauthorized"},{status:401})
        }
        
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        )

        const {data:products,error:productsError}=await supabase.from("products").select("*");

        if(productsError) throw productsError

        const res ={
            total:products.length,
            updated:0,
            failed:0,
            priceChanges:0,
            alertSent:0,
        }

        for(const product of products){
            try{
                const productData = await scrapeProduct(product.url)

                if(!productData.currentPrice){
                    results.failed++;
                    continue;
                }

                const newPrice = parseFloat(productData.currentPrice);
                const oldPrice = parseFloat(product.current_price);

                await supabase.from("products").update({
                    currentPrice:newPrice,
                    currency:productData.currenctCode || product.currency,
                    name:productData.productNamee || product.name,
                    image_url:productData.productImageUrl || product.image_url,
                    updated_at:new Date.toISOString()
                }).eq("id",product.id)

                if(oldPrice!==newPrice){
                    await supabase.from("price_history").insert({
                        product_id:product.id,
                        price:newPrice,
                        currency:productData.currencyCode || product.currency
                    })
                }

                results.priceChanges++

                if(newPrice<oldPrice){
                    const {
                        data :{user},
                    } = await supabase.auth.admin.getUserById(product.user_id)
                }

                if(user?.email){
                    //send email
                    const emailResult= await sendPriceDropAlert(
                        user.email,
                        product,
                        oldPrice,
                        newPrice
                    )

                    if(emailResult.success){
                        results.alertSent++;
                    }
                }
                results.updated++;
            }
            catch(err){
                console.log(err.message)
                results.failed++;
            }
        }

        return NextResponse.json({
            success:true,
            results,
            message:"Price checked completed"
        })
    }
    catch(err){
        console.log(err.message)
        return NextResponse.json({error:err.message})
    }
}

export async function GET() {
  return NextResponse.json({
    message: "Price check endpoint is working. Use POST to trigger.",
  });
}

// curl -X POST https://price-tracker-divyanshu.vercel.app/api/cron/check-prices \
// -H  "Authorization: Bearer 87b0ebe3c4c1226105a48c882b33518ea4e599cadda07f78129d1a9f546fe9e1"