
import Firecrawl from '@mendable/firecrawl-js';

const firecrawl = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });

export async function scrapeProduct(url){
    try{
        const result = await firecrawl.scrape(url,{
            "formats": [
        {
            "type": "json",
            "schema": {
                "type": "object",
                "required": [
                    "productName",
                    "currentPrice"
                ],
                "properties": {
                    "productName": {
                        "type": "string"
                      },
                    "currentPrice": {
                        "type": "string"
                    },
                    "currencyCode": {
                        "type": "string"
                    },
                    "productImageUrl": {
                        "type": "string"
                    }
                }
            },
            "prompt": "Extract the product name as 'productName', current price as a number as 'currentPrice', currency code (USD, EUR, etc) as 'currencyCode', and product image URL as 'productImageUrl' if available ,If price is written like .\"₹ 3,990\" or \"3,990\", convert it to a number like 3990 If price is not visible, return null."
        }
    ]
            
        });

        const extractedData = result.json;

        if (!extractedData || !extractedData.productName) {
            throw new Error("No data extracted from URL");
        }

        return extractedData;
    }
    catch(err){
        console.error("Firecrawl scrape error:", err);
        throw new Error(`Failed to scrape product: ${err.message}`);
    }
}