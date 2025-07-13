package com.yamu.backend.repository;

import com.yamu.backend.model.Message;
import com.yamu.backend.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    
    Logger logger = LoggerFactory.getLogger(MessageRepository.class);

    // Fixed query to properly fetch both sent and received messages
    @Query("SELECT m FROM Message m WHERE " +
           "(m.sender = :user1 AND m.receiver = :user2) OR " +
           "(m.sender = :user2 AND m.receiver = :user1) " +
           "ORDER BY m.timestamp ASC")
    List<Message> findConversation(@Param("user1") User user1,
                                   @Param("user2") User user2);

    // Debugged version that properly fetches received messages
    @Query("SELECT DISTINCT m.sender FROM Message m WHERE m.receiver = :user " +
           "AND m.sender <> :user") // Avoid self-messages
    default List<User> findSendersForReceiverDebug(@Param("user") User user) {
        logger.debug("Finding all senders for receiver {}", user.getId());
        List<User> senders = findSendersForReceiver(user);
        logger.debug("Found {} unique senders ------------------------------------------------------------------------------------", senders.size());
        return senders;
    }

    // Original method
    @Query("SELECT DISTINCT m.sender FROM Message m WHERE m.receiver = :user")
    List<User> findSendersForReceiver(@Param("user") User user);

    // Debugged version that properly fetches sent messages
    @Query("SELECT DISTINCT m.receiver FROM Message m WHERE m.sender = :user " +
           "AND m.receiver <> :user") // Avoid self-messages
    default List<User> findReceiversForSenderDebug(@Param("user") User user) {
        logger.debug("Finding all receivers for sender {}", user.getId());
        List<User> receivers = findReceiversForSender(user);
        logger.debug("Found {} unique receivers", receivers.size());
        return receivers;
    }

    // Original method
    @Query("SELECT DISTINCT m.receiver FROM Message m WHERE m.sender = :user")
    List<User> findReceiversForSender(@Param("user") User user);

    // Debugged version with logging
    default long countUnreadMessages(User receiver) {
        logger.debug("Counting unread messages for receiver {}", receiver.getId());
        long count = countByReceiverAndIsReadFalse(receiver);
        logger.debug("Found {} unread messages", count);
        return count;
    }

    // Original method
    long countByReceiverAndIsReadFalse(User receiver);

    // Debugged version that returns count of marked messages
    @Modifying
    @Query("UPDATE Message m SET m.isRead = true " +
           "WHERE m.receiver = :receiver AND m.sender = :sender AND m.isRead = false")
    default int markMessagesAsReadDebug(@Param("receiver") User receiver, 
                                      @Param("sender") User sender) {
        logger.debug("Marking messages as read from {} to {}", 
                    sender.getId(), receiver.getId());
        int updated = markMessagesAsRead(receiver, sender);
        logger.debug("Marked {} messages as read", updated);
        return updated;
    }

    // Original method modified to return count
    @Modifying
    @Query("UPDATE Message m SET m.isRead = true WHERE m.receiver = :receiver AND m.sender = :sender")
    int markMessagesAsRead(@Param("receiver") User receiver, @Param("sender") User sender);

    // NEW: Proper method to fetch all received messages
    @Query("SELECT m FROM Message m WHERE m.receiver = :user ORDER BY m.timestamp DESC")
    default List<Message> findAllReceivedMessages(@Param("user") User user) {
        logger.debug("Fetching all received messages for user {}", user.getId());
        List<Message> messages = findByReceiverOrderByTimestampDesc(user);
        logger.debug("Found {} received messages", messages.size());
        return messages;
    }

    // Repository method for the above
    List<Message> findByReceiverOrderByTimestampDesc(User receiver);

    // NEW: Method to fetch unread received messages
    @Query("SELECT m FROM Message m WHERE m.receiver = :user AND m.isRead = false ORDER BY m.timestamp DESC")
    default List<Message> findUnreadReceivedMessages(@Param("user") User user) {
        logger.debug("Fetching unread messages for user {}", user.getId());
        List<Message> messages = findByReceiverAndIsReadFalseOrderByTimestampDesc(user);
        logger.debug("Found {} unread messages", messages.size());
        return messages;
    }

    // Repository method for the above
    List<Message> findByReceiverAndIsReadFalseOrderByTimestampDesc(User receiver);
}