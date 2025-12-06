
const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
    Contentname : {
        type : String,
        require : true,
    },
    Yearofrelease : {
        type : Number,
        require : true
    },
    Requestby : {
        type : String,
        require : true
    },

    contentType :{
        type : String,
        enum : ['movie', 'webseries', 'anime'],
        require :true
    }
})

module.exports = mongoose.model("request", requestSchema);