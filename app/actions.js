"use server"

import { scrapeProduct } from "@/lib/firecrawl";
import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function signOut(){
    const supabase = await createClient();
    await supabase.auth.signOut();

    revalidatePath("/")
    redirect("/")
}

export async function addProduct(formData){
    const url = formData.get("url");

    if(!url){
        return { error :"URL is required"};
    }

    try{
        const supabase = await createClient();

        const {data : { user } } = await supabase.auth.getUser();

        if(!user){
            return { error : "Not signed in"}
        }

        const productData = await scrapeProduct(url);

        if(!productData.currentPrice || !productData.productName){
            console.log("productData",productData)
            return { message : "Could not extract product details "}
        }

        const rawPrice = productData.currentPrice;

        if (!rawPrice || !productData.productName) {
        console.log("productData", productData);
        return { message: "Could not extract product details" };
        }

        // clean price
        const cleaned = String(rawPrice).replace(/[^\d.]/g, "");
        const newPrice = parseFloat(cleaned);

        console.log(newPrice)

        if (isNaN(newPrice)) {
        return { message: "Invalid price extracted" };
        }
        
        const currency = productData.currencyCode === "₹" ? "INR" : productData.currencyCode || "INR";
        const {data:existingProduct} = await supabase.from("products").select("id,current_price").eq("user_id",user.id).eq("url",url).single();

        const update = !!existingProduct

        const {data:product,error} = await supabase.from("products").upsert({
            user_id:user.id,
            url,
            name:productData.productName,
            current_price:newPrice,
            currency,
            image_url:productData.productImageUrl,
            updated_at:new Date().toISOString(),
        },{
            onConflict:"user_id,url",
            ignoreDuplicates:false,
        }).select().single();

        if(error){
            console.log(error)
        }

        if(!existingProduct || existingProduct.current_price!==newPrice){
            await supabase.from("price_history").insert({
                product_id:product.id,
                price:newPrice,
                currency:currency,
            })
        }

        revalidatePath("/");
        return {
            success:true,
            product,
            mssage: update ?"Price updated":"product added"
        }
    }
    catch(err){
        console.log(err);
        return {message:err.message}
    }
}

export async function deleteProduct(productId){
    try{
        const supabase = await createClient();

        await supabase.from("products").delete().eq("id",productId);

        revalidatePath("/");
        
        return {
            message:"removed the product"+productId
        }

    }
    catch(err){
        console.log(err);
        return {
            message:err.message
        }
    }
}

export async function getProducts(){
    try{
        const supabase = await createClient();
        const {data : { user } } = await supabase.auth.getUser();

        const {data,error} = await supabase.from("products").select("*").eq("user_id",user.id).order("created_at",{ascending:false});

        console.log(data)
        console.log(user.id)

        return data || []
    }
    catch(err){
        console.log(err.message)
        return {
            message:err.message
        }
    }
}

export async function getPriceHistory(){
    try{
        const supabase = await createClient();

        const {data,error} = await supabase.from("price_history").select("*").eq("product_id",productId).order("checked_at",{ascending:true});

        return data || [];
    }
    catch(err){
        console.log(err.message)
        return {
            message:err.message
        }
    }
}