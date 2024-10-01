function errorHandler (err ="Server error", res) {
   if(err.status === 500){
      return res.status(500).json({status:"fail", message:err.message ||  'Something went wrong!'});
   }
   else if (err.status === 403){
    return  res.status(403).json({status:"fail", message:err.message ||  "Something went wrong!"});
    }
   else if (err.status === 400){
    return  res.status(400).json({status:"fail", message:err.message ||  "Something went wrong!"});
   }
   else if (err.status === 502){
    return   res.status(502).json({status:"fail", message:err.message ||  'Something went wrong!'});
   }
   else if (err.status === 503){
    return  res.status(503).json({status:"fail", message:err.message ||  'Something went wrong!'});
   }
   else if (err.status === 401){
      return  res.status(401).json({status:"fail", message:err.message ||  'unauthorized!'});
     }
   else {
    return  res.status(400).json({status:"fail", message:err.message ||  'Something went wrong!'});
   }
}

export default errorHandler;