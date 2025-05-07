package com.yamu.backend.repository;

import com.yamu.backend.model.Message;
import com.yamu.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findBySenderAndReceiverOrReceiverAndSenderOrderByTimestampAsc(
            User user1, User user2, User user3, User user4);

    @Query("SELECT DISTINCT m.sender FROM Message m WHERE m.receiver = :user")
    List<User> findSendersForReceiver(@Param("user") User user);

    @Query("SELECT DISTINCT m.receiver FROM Message m WHERE m.sender = :user")
    List<User> findReceiversForSender(@Param("user") User user);

    long countByReceiverAndIsReadFalse(User receiver);

    // Added query to mark messages as read
    @Modifying
    @Query("UPDATE Message m SET m.isRead = true WHERE m.receiver = :receiver AND m.sender = :sender")
    void markMessagesAsRead(@Param("receiver") User receiver, @Param("sender") User sender);
}