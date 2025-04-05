import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {io} from 'socket.io-client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRightFromBracket, faUsers, faPaperPlane, faImage } from '@fortawesome/free-solid-svg-icons'
import { ToastContainer, toast } from 'react-toastify'

import './Chatroom.css'

function ChatRoom(){
    const messageListRef = useRef(null)
    const navigate = useNavigate()

    const [socket, setSocket] = useState(null);
    const [joinRoomBool, setJoinRoomBool] = useState(true)
    const [roomName, setRoomName] = useState("")
    const [socketID, setSocketID] = useState("")

    const [sendMessage, setSendMessage] = useState("")
    const [recievedMessage, setRecievedMessage] = useState([])
    const [selectedImage, setSelectedImage] = useState(null)

    const [allUsers, setAllUsers] = useState([])

    const [showDropown, setShowDropdown] = useState(false)

    const user = JSON.parse(localStorage.getItem("user"))
    

    useEffect(() => {
        const newSocket = io("http://localhost:3000/");
        setSocket(newSocket);

        newSocket.on("connect", () => {
            console.log("connected", newSocket.id)
            setSocketID(newSocket.id)
        })

        newSocket.on('recieve-message' ,(data) => {
            setRecievedMessage((messages) => [...messages, data])
        })

        newSocket.on('user-joined', (data) => {
            setAllUsers((users) => [...users, data])
            toast(`${data.userName} joined`)
        })

        newSocket.on('room-users', (data)=>{
            setAllUsers(data)
        })

        newSocket.on('user-left', (data) => {
            toast(`${data.userName} left`)
        })

        return () => {
            newSocket.removeAllListeners();
            newSocket.disconnect();
        };


    }, [])

    useEffect(() => {
        if (messageListRef.current) {
            messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
        }

    }, [recievedMessage]);

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if(file){
            const reader = new FileReader()
            reader.onload = () => {
                setSelectedImage(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }
    
    const handleRoomJoin = (e) => {
        e.preventDefault()
        if(roomName.trim() === ""){
            alert("Please enter a Room name")
            return
        }   
        socket.emit('join-room', {
            roomName, 
            socketID:socket.id, 
            userName:user?.name,
            userEmail:user?.email,
            userPicture:user?.picture
        })
        setJoinRoomBool(false)
    }

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    }

    const handleMessageSend = (e) => {
        e.preventDefault()
        if(!sendMessage.trim() && !selectedImage) return
        socket.emit('send-message', {sendMessage, roomName,userImg:user?.picture, userName:user?.name, messageBool:true, timestamp:Date.now(), image:selectedImage})
        setRecievedMessage((messages) => [...messages, {sendMessage, roomName,userImg:user?.picture, userName:user?.name, messageBool:false, timestamp:Date.now(), image:selectedImage}])
        setSendMessage("")
        setSelectedImage(null)
    }


    return(
    <>
    <ToastContainer
    position="top-center"
    hideProgressBar={false}
    theme="dark"
    newestOnTop
    />
    <div className="container">
        <div className="top-bar">
            <div className="user-info">
            <img src={user?.picture} alt="Profile" width="100" referrerPolicy="no-referrer"></img>
            <h2>{user?.name}</h2>
            </div>
            <div className="nav-btns">
                {!joinRoomBool && (
                <div className="user-wrapper">
                    <button onClick={() => setShowDropdown(prev => !prev)} className="users"><FontAwesomeIcon icon={faUsers} /></button>
                    {showDropown && (
                    <div className="dropdown-content">
                    {allUsers.map((m,i) => (
                        <div className="user-info">
                            <img referrerPolicy="no-referrer" src={m.userPicture}></img>
                            <p>{m.userName}</p>
                        </div>
                    ))}
                    </div>
                    )}
                </div>
                )}
                <button onClick={handleLogout}><FontAwesomeIcon icon={faRightFromBracket} /></button>
            </div>
        </div>
        <div className="join-room">
            {joinRoomBool && (
            <form onSubmit={handleRoomJoin}>
            <h1>Chat Room</h1>
            <input value={roomName} onChange={e => setRoomName(e.target.value)} placeholder="Enter Room Name" ></input>
            <button type="submit">Join Room</button>
            </form>
            )}
        </div>



        
            {!joinRoomBool && (
            <>
            <div className="message-area">
            <div className="message-list" ref={messageListRef}>
                {recievedMessage?.slice().reverse().map((m,i) => (
                    <>
                    <div className={`message-box ${m.messageBool ? "left" : "right"}`}>
                        <div className="message-content">
                            {m.image ? (
                                <img src={m.image} alt="Sent" className="sent-image"/>
                            ) : (
                                <div className="message-bubble">{m.sendMessage}</div>
                            )

                            }
                            <span className="timestamp">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <img className="message-box-img" src={m?.userImg} referrerPolicy="no-referrer" alt="Profile" width="100" />
                    </div>
                    </>
                ))}
                 
            </div>
            
            <div className="input-class">
                {/* Image Preview */}
            {selectedImage && (
                <div className="image-preview">
                    <img src={selectedImage} alt="Preview" className="preview-img" />
                    <button className="remove-preview" onClick={() => setSelectedImage(null)}>✖</button>
                </div>
            )}
            <form onSubmit={handleMessageSend}>
                <input value={sendMessage} onChange={e => setSendMessage(e.target.value)} placeholder="Enter Message" />
                    <label>
                        <FontAwesomeIcon icon={faImage}/>
                        <input type="file" accept="image/*" onChange={handleImageChange} hidden />
                    </label>
                <button type="submit"><FontAwesomeIcon icon={faPaperPlane} /></button>
            </form>
            
            </div>
            </div>
            </>
            )}
        
    </div>
    </>
    )
}

export default ChatRoom;