package org.practicals.backend.service.notificationManagement;

import org.practicals.backend.model.notificationManagement.Notification;
import org.practicals.backend.model.notificationManagement.NotificationType;
import org.practicals.backend.model.userManagement.User;
import org.practicals.backend.repository.notificationManagement.NotificationRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void notify(User user, String title, String message, NotificationType type) {
        Notification n = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .build();
        notificationRepository.save(n);
    }

    public Page<Notification> myNotifications(Long userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }
}
