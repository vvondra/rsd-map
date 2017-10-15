package cz.vojtechvondra.rsd

import org.springframework.boot.SpringApplication
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.context.annotation.Bean
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

@SpringBootApplication
class RsdApplication {
    @Bean
    fun corsConfigurer(): WebMvcConfigurer {
        return object : WebMvcConfigurer {
            override fun addCorsMappings(registry: CorsRegistry?) {
                registry!!.addMapping("/*").allowedOrigins("*")
            }

            override fun addViewControllers(registry: ViewControllerRegistry?) {
                // forward requests to /admin and /user to their index.html
                registry!!.addViewController("/").setViewName(
                    "forward:/index.html")
            }
        }
    }
}

fun main(args: Array<String>) {
    SpringApplication.run(RsdApplication::class.java, *args)
}
