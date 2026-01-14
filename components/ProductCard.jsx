"use client"

import { deleteProduct } from "@/app/actions";
import React from "react"
import { useState } from "react"
import { toast } from "sonner";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ChevronDown, ChevronUp, ExternalLink, TrendingDown } from "lucide-react";
import Link  from "next/link";
import { Button } from "./ui/button";

export default function ProductCard({product}){
    const [showChart,setShowChart] = useState(false);
    const [deleting,setDeleting] = useState(false);

    async function Delete(){
        if(!confirm("Remove this product from tracking?")) return;

        setDeleting(true);
        const res=await deleteProduct(product.id)

        if(res.error){
            toast.error(res.error)
        }
        else{
            toast.success(res.message || "product deleted");
            setUrl("")
        }

        setDeleting(false)


    }

    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className={"pb-3"}>
                <div className="flex gap-4">
                    {product.image_url &&(
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-30 h-40 object-cover rounded-md border"
                        />
                    )}

                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">{product.name}</h3>
                   

                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-green-600">
                                {product.currency} {product.current_price}
                            </span>

                            <Badge variant="secondary" className="gap-1">
                                <TrendingDown className="w-3 h-3"/>
                                Tracking
                            </Badge>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrp gap-2">
                    <Button variant="outline" size="sm" onClick={()=>setShowChart(!showChart)} className={"gap-1"}>
                        {showChart?(
                            <>
                               <ChevronUp className="w-4 h-4"/>
                            </>
                        ):(
                            <>
                              <ChevronDown className="w-4 h-4"/>
                            </>
                        )}
                    </Button>
                    
                    <Button variant="outline" size="sm" className='gap-1'>
                        <Link href={product.url} target="_blank" rel="noopener noreferrer" className="flex flex-row">
                          <ExternalLink className="w-4 h-4"/>
                           View 
                        </Link>
                    </Button>
                </div>
            </CardContent>
            <CardFooter>
                <p>Card Footer</p>
            </CardFooter>
        </Card>
    )
}