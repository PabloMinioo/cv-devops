package dev.pablo.cvapi;

import jakarta.persistence.*;

@Entity
@Table(name = "visitors")
public class Visitor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String name;

    protected Visitor() {}

    public Visitor(String name) {
        this.name = name;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
}