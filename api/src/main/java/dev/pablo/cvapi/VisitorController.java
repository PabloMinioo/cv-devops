package dev.pablo.cvapi;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/visitors")
public class VisitorController {

    public record VisitorRequest(@NotBlank @Size(max = 50) String name) {}
    public record VisitorResponse(Long id, String name) {}

    private final VisitorRepository repository;

    public VisitorController(VisitorRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public VisitorResponse create(@Valid @RequestBody VisitorRequest request) {
        Visitor saved = repository.save(new Visitor(request.name().trim()));
        return new VisitorResponse(saved.getId(), saved.getName());
    }

    @GetMapping("/count")
    public long count() {
        return repository.count();
    }
}