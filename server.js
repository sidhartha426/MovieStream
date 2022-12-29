const http=require("http");
const fs=require("node:fs");
const qs = require('node:querystring');



const getFile=(path,res,options)=>{
  const fst=fs.createReadStream(path,options);
  fst.on("data",(chunk)=>{
    res.write(chunk);
  });
  fst.on("end",()=>{
    res.end();
  });
  fst.on("error",(err)=>{
    //console.log(`Stream=>Err ${path} ${options}`);
    res.end();
  })
  
}

const server = http.createServer((req, res) => {

  console.log(`${req.method} Request received from ${req.socket.remoteAddress}`);
  
  //console.log(req.socket);
  
  if(req.method==="GET"){
  
    const url=req.url;
    //console.log(url);
    
    let path=(url==="/")?"index.html":req.url.substring(1);
 
    //console.log(`Path ${path} \n`);
    
    let options={};
    
    if(url.includes("mp4")){
    
      path=Object.keys(qs.decode(path))[0];
      
      //console.log(path);
      
      path=path.substring(5);
      
      //console.log(path);
      
      //path="movie.mp4";

      const size=fs.statSync(path).size;
      
      let start=0,end=size-1;
      
      
      start=parseInt(req.headers.range.split("=")[1].split("-")[0]);
      
      end=Math.min(start+10485760,size-1);
      
      //console.log(`${req.url} ${req.headers.range} start ${start} end ${end}`);
      //console.log(start);
      
      res.writeHead(206,{
        "Content-Range": `bytes ${start}-${end}/${size}`,
        "Accept-Ranges": "bytes",
        "Content-Length": end - start + 1,
        "Content-Type": "video/mp4"
      });
      
      
      options={start:start,end:end};
    }
      
    else
      res.writeHead(200);
         
    getFile(path,res,options);
  
  }
  else{
    res.writeHead(200);
    res.end();
  }
  
});

server.listen({port:5698},()=>{
  console.log("Server is Started and Listening");
});



