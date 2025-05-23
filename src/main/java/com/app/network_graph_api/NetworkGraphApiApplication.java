package com.app.network_graph_api;

import com.app.network_graph_api.model.api.NetworkGraph;
import com.app.network_graph_api.model.db.GraphDto;
import com.app.network_graph_api.repo.GraphRepository;
import com.app.network_graph_api.utils.GsonUtils;
import com.app.network_graph_api.utils.NetworkGraphUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jackson.JacksonAutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication(exclude = { JacksonAutoConfiguration.class })
public class NetworkGraphApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(NetworkGraphApiApplication.class, args);
	}

	@Bean
	public PasswordEncoder encoder() {
		return new BCryptPasswordEncoder();
	}

	/**
	 * Миграция существующих данных - добавление поля networkNodes для всех графов
	 * ОТКЛЮЧЕНО: может вызывать зависание приложения при запуске
	 * Миграция теперь выполняется в сервисах по мере необходимости
	 */
	// @Bean
	// public CommandLineRunner migrateExistingData(@Autowired GraphRepository
	// graphRepository) {
	// return args -> {
	// // Получаем все существующие графы
	// Iterable<GraphDto> allGraphs = graphRepository.findAll();

	// // Обновляем каждый граф, добавляя networkNodes
	// for (GraphDto graphDto : allGraphs) {
	// // Десериализуем JSON в объект NetworkGraph
	// NetworkGraph graph = GsonUtils.gson().fromJson(graphDto.getJson(),
	// NetworkGraph.class);

	// // Если поля networkNodes нет, генерируем его из старого формата
	// if (graph.getNetworkNodes() == null) {
	// graph.setNetworkNodes(NetworkGraphUtils.convertToNetworkNodes(graph));

	// // Сериализуем обратно в JSON
	// String updatedJson = GsonUtils.gson().toJson(graph);

	// // Обновляем запись в базе данных
	// graphDto.setJson(updatedJson);
	// graphRepository.save(graphDto);

	// System.out.println("Обновлен граф с ID: " + graphDto.getId());
	// }
	// }

	// System.out.println("Миграция данных завершена");
	// };
	// }
}
