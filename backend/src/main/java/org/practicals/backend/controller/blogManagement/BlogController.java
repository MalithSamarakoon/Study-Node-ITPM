package org.practicals.backend.controller.blogManagement;

import org.practicals.backend.model.blogManagement.Blog;
import org.practicals.backend.model.userManagement.User;
import org.practicals.backend.repository.userManagement.UserRepository;
import org.practicals.backend.security.services.UserDetailsImpl;
import org.practicals.backend.service.blogManagement.BlogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/blogs")
@CrossOrigin(origins = "http://localhost:5173")
public class BlogController {

    @Autowired
    private BlogService blogService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<Blog> getAllBlogs() {
        return blogService.getAllBlogs();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Blog> getBlogById(@PathVariable Long id) {
        Blog blog = blogService.getBlogById(id);
        return (blog != null) ? ResponseEntity.ok(blog) : ResponseEntity.notFound().build();
    }

    @GetMapping("/me")
    public ResponseEntity<List<Blog>> getMyBlogs(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return ResponseEntity.ok(blogService.getBlogsByUserId(userDetails.getId()));
    }

    @PostMapping
    public ResponseEntity<Blog> createBlog(@RequestBody Blog blog, Authentication authentication) {

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();


        User currentUser = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));


        Blog savedBlog = blogService.createBlog(blog, currentUser);

        return ResponseEntity.ok(savedBlog);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Blog> updateBlog(@PathVariable Long id, @RequestBody Blog blog) {
        // We delegate the update logic to the service we wrote earlier
        Blog updated = blogService.updateBlog(id, blog);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBlog(@PathVariable Long id, Authentication authentication) {

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        Blog blog = blogService.getBlogById(id);

        if (blog == null) {
            return ResponseEntity.notFound().build();
        }

        if (!blog.getWriter().getId().equals(userDetails.getId())) {
            return ResponseEntity.status(403).body("Error: You can only delete your own articles.");
        }

        blogService.deleteBlog(id);

        return ResponseEntity.ok("Blog deleted successfully");
    }
}
