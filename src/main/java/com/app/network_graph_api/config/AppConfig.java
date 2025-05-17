package com.app.network_graph_api.config;

import com.app.network_graph_api.model.api.NetworkGraph;
import com.app.network_graph_api.utils.NetworkGraphDeserializer;
import com.app.network_graph_api.utils.NetworkGraphSerializer;
import com.google.gson.GsonBuilder;
import org.springframework.boot.autoconfigure.gson.GsonBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.EnableAspectJAutoProxy;

import java.util.List;

@Configuration
@EnableAspectJAutoProxy
public class AppConfig {

    @Bean
    public GsonBuilder gsonBuilder(List<GsonBuilderCustomizer> customizers) {
        GsonBuilder builder = new GsonBuilder();
        customizers.forEach((c) -> c.customize(builder));

        builder.registerTypeAdapter(NetworkGraph.class, new NetworkGraphDeserializer());
        builder.registerTypeAdapter(NetworkGraph.class, new NetworkGraphSerializer());

        return builder;
    }
}
