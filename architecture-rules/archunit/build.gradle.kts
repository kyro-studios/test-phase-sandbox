plugins {
    java
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
    testImplementation(platform("org.junit:junit-bom:5.13.4"))
    testImplementation("org.junit.jupiter:junit-jupiter")
    testImplementation("com.tngtech.archunit:archunit-junit5:1.4.1")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

tasks.test {
    useJUnitPlatform()
    // 検査するクラスファイルのディレクトリ。例: -PclassesDir=../../app/backend/build/classes/java/main
    systemProperty(
        "archunit.classesDir",
        layout.projectDirectory.dir(providers.gradleProperty("classesDir").get()).asFile.absolutePath,
    )
    // 毎回実行する
    outputs.upToDateWhen { false }
}
