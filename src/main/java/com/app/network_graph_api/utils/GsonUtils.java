package com.app.network_graph_api.utils;

import com.app.network_graph_api.model.api.NetworkGraph;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

public final class GsonUtils {

    private GsonUtils() {
        // no init
    }

    public static Gson gson() {
        return new GsonBuilder()
                .registerTypeAdapter(NetworkGraph.class, new NetworkGraphSerializer())
                .registerTypeAdapter(NetworkGraph.class, new NetworkGraphDeserializer())
                .create();
    }
}
