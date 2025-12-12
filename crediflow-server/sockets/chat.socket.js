import Application from '../models/Application.model.js';

export const handleSocketConnection = (socket, io) => {
  // Join application room
  socket.on('join-application', (applicationId) => {
    socket.join(applicationId);
    console.log(`Socket ${socket.id} joined application ${applicationId}`);
  });

  // Handle chat message
  socket.on('send-message', async (data) => {
    try {
      const { applicationId, message, sender } = data;

      const application = await Application.findOne({ applicationId });
      if (!application) {
        socket.emit('error', { message: 'Application not found' });
        return;
      }

      // Add message to chat history
      application.chatHistory.push({
        sender,
        message,
      });

      await application.save();

      // Broadcast to all clients in the application room
      io.to(applicationId).emit('new-message', {
        sender,
        message,
        timestamp: new Date(),
      });

      // Generate bot response if message is from user
      if (sender === 'user') {
        setTimeout(() => {
          const botResponse = generateQuickResponse(message, application);
          
          application.chatHistory.push({
            sender: 'bot',
            message: botResponse,
          });

          application.save();

          io.to(applicationId).emit('new-message', {
            sender: 'bot',
            message: botResponse,
            timestamp: new Date(),
          });
        }, 1000);
      }
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // Handle stage updates
  socket.on('update-stage', async (data) => {
    try {
      const { applicationId, stage } = data;

      const application = await Application.findOne({ applicationId });
      if (!application) {
        socket.emit('error', { message: 'Application not found' });
        return;
      }

      application.stage = stage;
      await application.save();

      io.to(applicationId).emit('stage-updated', {
        stage,
        timestamp: new Date(),
      });
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // Handle typing indicator
  socket.on('typing', (applicationId) => {
    socket.to(applicationId).emit('user-typing');
  });

  socket.on('stop-typing', (applicationId) => {
    socket.to(applicationId).emit('user-stop-typing');
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`Socket ${socket.id} disconnected`);
  });
};

// Helper function for quick responses
function generateQuickResponse(message, application) {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return "Hello! I'm your CrediFlow assistant. How can I help you today?";
  }

  if (lowerMessage.includes('status')) {
    return `Your application is currently in the ${application.stage} stage with status: ${application.status}.`;
  }

  if (lowerMessage.includes('emi')) {
    const emi = application.emi || application.calculateEMI();
    return `Your estimated EMI is ₹${emi} for ${application.tenure} months.`;
  }

  if (lowerMessage.includes('document')) {
    return "Please upload your PAN card, Aadhar card, and recent salary slips. You can use the upload button below.";
  }

  return "Thank you for your message. Our team will assist you shortly!";
}
