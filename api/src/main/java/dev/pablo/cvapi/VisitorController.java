package dev.pablo.cvapi;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/visitors")
public class VisitorController {

    public record VisitorRequest(@NotBlank @Size(max = 50) String name) {}
    public record VisitorResponse(Long id, String name) {}

    private static final Logger log = LoggerFactory.getLogger(VisitorController.class);
    private final VisitorRepository repository;
    private final Counter registered;

    public VisitorController(VisitorRepository repository, MeterRegistry registry) {
        this.repository = repository;
        this.registered = Counter.builder("cv_visitors_registered")
                .description("Visitors registered since the app started")
                .register(registry);
        Gauge.builder("cv_visitors_total", repository, VisitorRepository::count)
                .description("Total visitors stored in the database")
                .register(registry);
    }

    @PostMapping
    public VisitorResponse create(@Valid @RequestBody VisitorRequest request) {
        Visitor saved = repository.save(new Visitor(request.name().trim()));
        registered.increment();
        log.info("Visitante registrado id={}", saved.getId());
        return new VisitorResponse(saved.getId(), saved.getName());
    }
    
    @GetMapping("/count")   
    public long count() {
        return repository.count();
    }
}