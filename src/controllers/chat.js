import { serverError } from '../constants.js';
import { Chat } from '../models/chat.js';
import { Room } from '../models/room.js';

export class ChatController {
  static getOrCreateRoomName = async (senderId, reveiverId) => {
    const userIds = [senderId, reveiverId];
    userIds.sort();
    const roomName = userIds[0] + userIds[1];

    let room;
    room = await Room.findOne({ room: roomName });
    console.log('room===', room);
    if (!room) {
      room = await Room.create({
        room: roomName,
        participents: userIds,
      });
    }
    return room;
  };
  static createPrivateMessage = async (req, res) => {
    const { receiverId } = req.params;

    try {
      const room = await ChatController.getOrCreateRoomName(
        req.user.id,
        receiverId
      );

      if (receiverId == req.user.id) {
        return res.status(400).send({
          success: false,
          message: 'Reveiver and sender id cant be same',
        });
      }
      const chatMsg = await Chat.create({
        sender: req.user.id,
        receiver: receiverId,
        message: req.body.message,
        room: room.room,
      });
      return res.status(201).send({
        message: 'Chat created successfully',
        success: true,
        data: chatMsg,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send(serverError);
    }
  };

  static listLastMsgWithUsers = async (req, res) => {
    try {
      const rooms = await Room.find({
        participents: { $in: req.user.id },
      });
      console.log('rooms ===');

      const lastMessagesPromises = rooms.map(async (item) => {
        const chat = await Chat.findOne({
          room: item.room,
        }).sort('-createdAt');
        console.log('chat===', chat);
        return chat;
      });

      const lastMessages = await Promise.all(lastMessagesPromises);

      return res.status(200).send({
        success: true,
        message: 'Last msg fetched',
        data: lastMessages,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send(serverError);
    }
  };
}
