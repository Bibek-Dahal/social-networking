import { Server } from 'socket.io';
import { Chat } from '../models/chat.js';

import { Profile } from '../models/profile.js';
import mongoose from 'mongoose';
import { User } from '../models/user.js';
import { websockAuthMiddleware } from '../middlewares/custom_auth_middleware.js';
import { ChatController } from '../controllers/chat.js';

let onlineUsers = [];

export const io = new Server({
  cors: {
    origin: '*',
    // credentials: true
  },
});

io.use(websockAuthMiddleware);

io.on('connection', async (socket) => {
  // console.log("connection called", socket);
  const userId = socket.user.id;
  const user = await User.findById(userId, { password: 0 }).populate('profile');
  let users = [];
  console.log(socket.user._id);

  //append new user to online user list msg will be sent to all except user

  //join user to room
  socket.join(userId);

  users.push({
    userId: userId,
    username: user.userName,
  });
  // notify existing users
  socket.broadcast.emit('userConnected', {
    user: user,
  });

  onlineUsers.push(user);
  // chatData = c;

  console.log('Online user', onlineUsers);

  //basic emit to the sender
  io.emit('listOnlineUsers', onlineUsers);

  //display list of online users
  socket.on('listOnlineUsers', async (data) => {
    io.emit('llistOnlineUsers', onlineUsers);
  });

  //join the room for private chatting
  socket.on('joinPrivateChatRoom', async (data) => {
    try {
      const { userId } = JSON.parse(data);
      const roomName = await ChatController.getOrCreateRoomName(
        data.userId,
        socket.user.id
      );
      //join socket to room
      socket.join(roomName);
    } catch (error) {
      throw new Error('Cant connect to server');
    }
  });

  //emitted when user send private message
  socket.on('privateMessage', async (data) => {
    //user is already joined to room on its own id so socket.to(to) will send msg
    //to room where only single user exists
    // console.log("data", JSON.parse(data));
    // data = JSON.parse(data);
    console.log('data==', data);
    try {
      let { receiver, message } = JSON.parse(data);
      console.log('receiver====', receiver);
      const roomName = await ChatController.getOrCreateRoomName(
        receiver,
        socket.user._id
      );

      // if (
      //   message_type == "file" ||
      //   message_type == "image" ||
      //   message_type == "audio"
      // ) {
      //   console.log("Received audio data!");

      //   try {
      //     // decode the Base64 string to a buffer
      //     // console.log("file", data.file);
      //     const decodedAudio = Buffer.from(data.file, "base64");
      //     const response = await uploadFromBuffer(decodedAudio, "video");
      //     console.log("cloudinary res", response);
      //     cloudinaryRes = response;
      //     text = response.secure_url;
      //     console.log(text);
      //   } catch (error) {
      //     console.log(error);
      //     console.log("sorry cant upload file");
      //   }

      // }
      const newChat = await Chat.create({
        sender: socket.user.id,
        receiver: receiver,
        message: message,
        room: roomName,
      });

      const populated_chat = await newChat.populate('receiver sender');

      console.log(populated_chat);

      io.to(roomName).emit('privateMessage', {
        chat: populated_chat,
      });
    } catch (error) {
      console.log('error==', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('socket disconnect called');
    console.log('previous length', onlineUsers.length);
    console.log(socket.userId);
    const filteredArray = onlineUsers.filter(
      (obj) => obj['_id'].toString() !== socket.user.id
    );
    console.log('after length', filteredArray.length);
    onlineUsers = filteredArray;
    io.emit('listOnlineUsers', filteredArray);
  });
});
// ...
