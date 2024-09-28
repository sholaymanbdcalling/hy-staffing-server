function errorHandler (err, req, res) {
   if(err.status === 500){
       res.status(500).json({status:"fail", message:err.message ||  'Something went wrong!'});
   }
   else if (err.status === 403){
        res.status(403).json({status:"fail", message:err.message ||  "Something went wrong!"});
    }
   else if (err.status === 400){
       res.status(400).json({status:"fail", message:err.message ||  "Something went wrong!"});
   }
   else if (err.status === 502){
       res.status(502).json({status:"fail", message:err.message ||  'Something went wrong!'});
   }
   else if (err.status === 503){
       res.status(503).json({status:"fail", message:err.message ||  'Something went wrong!'});
   }
   else{
       res.status(400).json({status:"fail", message:err.message});
   }
}

export default errorHandler;