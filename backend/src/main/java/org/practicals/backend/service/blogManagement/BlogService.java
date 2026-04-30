package org.practicals.backend.service.blogManagement;

import org.practicals.backend.model.blogManagement.Blog;
import org.practicals.backend.model.blogManagement.Tag;
import org.practicals.backend.model.userManagement.User;
import org.practicals.backend.repository.blogManagement.BlogRepository;
import org.practicals.backend.repository.blogManagement.BlogTagRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class BlogService {

    @Autowired
    private BlogRepository blogRepository;

    @Autowired
    private BlogTagRepository blogTagRepository;

    public List<Blog> getAllBlogs() {
        return blogRepository.findAll();
    }

    public List<Blog> getBlogsByUserId(Long userId) {
        return blogRepository.findByWriterId(userId);
    }

    public Blog getBlogById(Long id) {
        return blogRepository.findById(id).orElse(null);
    }

    @Transactional
    public Blog createBlog(Blog blog, User writer) {
        // 1. Link the writer entity
        blog.setWriter(writer);

        // 2. Handle Tags: Check if they exist, create if not
        if (blog.getTags() != null && !blog.getTags().isEmpty()) {
            Set<Tag> persistentTags = blog.getTags().stream()
                    .map(tag -> blogTagRepository.findByName(tag.getName())
                            .orElseGet(() -> blogTagRepository.save(new Tag(tag.getName()))))
                    .collect(Collectors.toSet());

            blog.setTags(persistentTags);
        }

        // 3. Save to database
        return blogRepository.save(blog);
    }

    @Transactional
    public Blog updateBlog(Long id, Blog updatedBlog) {
        // 1. Find existing blog
        Blog existingBlog = blogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Blog not found with id: " + id));

        // 2. Update basic fields
        existingBlog.setTopic(updatedBlog.getTopic());
        existingBlog.setContent(updatedBlog.getContent());
        existingBlog.setImageUrl(updatedBlog.getImageUrl());

        // 3. Update Tags using the same logic as creation
        processTags(existingBlog, updatedBlog.getTags());

        return blogRepository.save(existingBlog);
    }

    @Transactional
    public void deleteBlog(Long id) {

        if (!blogRepository.existsById(id)) {
            throw new RuntimeException("Blog not found with id: " + id);
        }

        blogRepository.deleteById(id);
    }


    private void processTags(Blog blog, Set<Tag> incomingTags) {
        if (incomingTags != null) {
            Set<Tag> persistentTags = incomingTags.stream()
                    .map(tag -> blogTagRepository.findByName(tag.getName())
                            .orElseGet(() -> blogTagRepository.save(new Tag(tag.getName()))))
                    .collect(Collectors.toSet());
            blog.setTags(persistentTags);
        }
    }

    private void processTags(Blog blog) {
        processTags(blog, blog.getTags());
    }
}
