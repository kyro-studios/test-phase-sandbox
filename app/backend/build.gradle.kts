plugins {
    java
    application
    id("com.diffplug.spotless") version "7.2.1"
}

repositories {
    mavenCentral()
}

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

dependencies {
    implementation("io.javalin:javalin:6.7.0")
    implementation("com.fasterxml.jackson.core:jackson-databind:2.20.0")
    runtimeOnly("org.slf4j:slf4j-simple:2.0.17")

    testImplementation(platform("org.junit:junit-bom:5.13.4"))
    testImplementation("org.junit.jupiter:junit-jupiter")
    testImplementation("io.javalin:javalin-testtools:6.7.0")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

application {
    mainClass = "com.example.app.Application"
}

spotless {
    java {
        googleJavaFormat()
    }
}

tasks.test {
    useJUnitPlatform()
}
