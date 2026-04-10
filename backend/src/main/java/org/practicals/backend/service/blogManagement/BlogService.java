package org.practicals.backend.service.blogManagement;
import org.practicals.backend.model.blogManagement.Blog;
import org.practicals.backend.model.blogManagement.Tag;
import org.practicals.backend.repository.blogManagement.BlogRepository;
import org.practicals.backend.repository.blogManagement.BlogTagRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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

    public Blog getBlogById(Long id) {
        return blogRepository.findById(id).orElse(null);
    }

    public Blog createBlog(Blog blog) {
        // Handle tags: Check if exists, otherwise create new
        Set<Tag> persistentTags = blog.getTags().stream()
                .map(tag -> blogTagRepository.findByName(tag.getName())
                        .orElseGet(() -> blogTagRepository.save(new Tag(tag.getName()))))
                .collect(Collectors.toSet());

        blog.setTags(persistentTags);
        return blogRepository.save(blog);
    }
}
