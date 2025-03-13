import ChatRoom from './Chatroom.jsx';
import {Routes, Route, Navigate} from 'react-router-dom'
import GoogleAuth from './login.jsx';
import './index.css';  


function App() {

  const PrivateRoute = ({children}) => {
    const token = localStorage.getItem("token");
    return token ? children : <Navigate to="/" replace/>;
  }

  return(<>
          
          <Routes>
            <Route path='/' element={<GoogleAuth/>}/>
            <Route path='/chat-room' element={<PrivateRoute><ChatRoom/></PrivateRoute>}/>
          </Routes>
          
        </>)
}

export default App;
