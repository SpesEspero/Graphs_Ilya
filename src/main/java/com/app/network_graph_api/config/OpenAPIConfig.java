package com.app.network_graph_api.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.media.Schema;
import io.swagger.v3.oas.models.media.ArraySchema;
import io.swagger.v3.oas.models.media.ObjectSchema;
import io.swagger.v3.oas.models.media.StringSchema;
import io.swagger.v3.oas.models.media.NumberSchema;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Map;

@Configuration
public class OpenAPIConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Network Graph API")
                        .version("1.0")
                        .description("API для создания и работы с сетевыми графами")
                        .contact(new Contact()
                                .name("Support Team")
                                .email("support@example.com"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("http://www.apache.org/licenses/LICENSE-2.0.html")))
                .components(new Components()
                        .addSchemas("NetworkNode", createNetworkNodeSchema())
                        .addSchemas("NetworkGraph", createNetworkGraphSchema())
                        .addSchemas("GraphRequest", createGraphRequestSchema())
                        .addSchemas("GraphResponse", createGraphResponseSchema())
                        .addSchemas("GraphPathResponse", createGraphPathResponseSchema()));
    }

    private Schema<?> createNetworkNodeSchema() {
        return new ObjectSchema()
                .description("Узел сети в новом формате")
                .addProperty("name", new StringSchema().description("Название узла"))
                .addProperty("parameters", new ArraySchema().items(new NumberSchema())
                        .description("Веса соединений с другими узлами"))
                .addProperty("connectedNodes", new ArraySchema().items(new StringSchema())
                        .description("Имена узлов, с которыми установлены соединения"));
    }

    private Schema<?> createNetworkGraphSchema() {
        return new ObjectSchema()
                .description("Граф сети")
                .addProperty("networkNodes", new ArraySchema()
                        .items(new Schema<>().$ref("#/components/schemas/NetworkNode"))
                        .description("Список узлов сети в новом формате"));
    }

    private Schema<?> createGraphRequestSchema() {
        return new ObjectSchema()
                .description("Запрос на создание графа")
                .addProperty("networkNodes", new ArraySchema()
                        .items(new Schema<>().$ref("#/components/schemas/NetworkNode"))
                        .description("Список узлов сети"));
    }

    private Schema<?> createGraphResponseSchema() {
        return new ObjectSchema()
                .description("Ответ с информацией о графе")
                .addProperty("id", new NumberSchema().description("Идентификатор графа"))
                .addProperty("graph", new Schema<>().$ref("#/components/schemas/NetworkGraph"))
                .addProperty("successful", new Schema<Boolean>().description("Статус успешности операции"))
                .addProperty("error", new Schema<String>().description("Информация об ошибке (если есть)"));
    }

    private Schema<?> createGraphPathResponseSchema() {
        return new ObjectSchema()
                .description("Ответ с информацией о кратчайшем пути в графе")
                .addProperty("path", new ArraySchema().items(new StringSchema())
                        .description("Список имен узлов, составляющих кратчайший путь"))
                .addProperty("totalWeight", new NumberSchema().description("Общий вес пути"))
                .addProperty("successful", new Schema<Boolean>().description("Статус успешности операции"))
                .addProperty("error", new Schema<String>().description("Информация об ошибке (если есть)"));
    }
}