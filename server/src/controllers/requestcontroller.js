const request = require("../models/request");

const createrequest = async (req,res)=>{
const {Contentname, Yearofrelease, Requestby, contentType} = req.body;
if (!Contentname || !Yearofrelease || !Requestby || !contentType) {
    return res.status(400).json({error:"All Fields are required"})
}

try {
    const newrequest = new request({
        Contentname, 
        Yearofrelease, 
        Requestby, 
        contentType
    })
    const savedrequest = await newrequest.save()
    res.status(201).json(savedrequest);

} catch (err) {
    res.status(500).json(err.message)
}
}

const getallrequests = async (req,res)=>{
    
}

