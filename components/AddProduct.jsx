"use client"

import { Loader2 } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import React ,{useState} from "react"
import { AuthPage } from "./AuthPage"
import { addProduct } from "@/app/actions"
import { toast } from "sonner"

const AddProducts = ({user}) =>{

    const [url,setUrl] = useState("")
    const [loading,setLoading] = useState(false);
    const [showAuthModal,setShowAuthModal] = useState(false)

    const handleSubmit = async(e)=>{
        e.preventDefault();

        if(!user){  
            setShowAuthModal(true);
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append("url",url);

        const res = await addProduct(formData);

        if(res.error){
            toast.error(res.error)
        }
        else{
            toast.success(res.message);
            setUrl("")
        }

        setLoading(false);
    }

    return (
    <>
    <form  onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-2">
            <Input type="url" value={url} onChange={(e) => setUrl(e.target.value)} 
              placeholder="Paste product URL (Amazon, PUMA, etc.)" className="h-12 text-base"
              required
              disabled={loading}
            />

            <Button  className="bg-orange-400 hover:bg-orange-600 h-10 sm:h-12 px-8" type="submit" disabled={loading}> 
                {loading ? (
                    <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                    Adding...
                    </>
                ):(
                    "Track"
                )}
             </Button>
        </div>
    </form>
    <AuthPage
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
    />
    </>
    )
}

export default AddProducts