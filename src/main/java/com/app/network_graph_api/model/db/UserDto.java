package com.app.network_graph_api.model.db;

import jakarta.persistence.*;

import java.util.Set;

import static jakarta.persistence.GenerationType.IDENTITY;

@Entity
public class UserDto {

    @Id
    @GeneratedValue(strategy = IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true)
    private String login;

    @Column(nullable = false, columnDefinition="TEXT")
    private String name;

    @Column(nullable = false, columnDefinition="TEXT")
    private String passwordHash;

    @Column(nullable = false)
    private Integer status;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<TokenDto> tokens;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<GraphDto> graphs;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getLogin() {
        return login;
    }

    public void setLogin(String login) {
        this.login = login;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public Set<TokenDto> getTokens() {
        return tokens;
    }

    public void setTokens(Set<TokenDto> tokens) {
        this.tokens = tokens;
    }

    public Set<GraphDto> getGraphs() {
        return graphs;
    }

    public void setGraphs(Set<GraphDto> graphs) {
        this.graphs = graphs;
    }
}
