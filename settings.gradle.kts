pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

fun bootstrapLocalAndroidSdk(projectRoot: File) {
    val systemSdk = File("/opt/android-sdk")
    val localSdk = projectRoot.resolve(".android-sdk")
    if (!systemSdk.exists() || localSdk.resolve("platforms/android-37/android.jar").exists()) return

    val licensesDir = localSdk.resolve("licenses").apply { mkdirs() }
    licensesDir.resolve("android-sdk-license").writeText(
        "\n8933bad161af4178b1185d1a37fbf41ea5269c55\nd56f5187479451eabf01fb78af6dfcb131a6481e\n24333f8a63b6825ea9c5514f83c2829b004d1fee\n"
    )

    listOf("build-tools", "platform-tools").forEach { dirName ->
        val target = systemSdk.resolve(dirName)
        val link = localSdk.resolve(dirName)
        if (target.exists() && !link.exists()) {
            ProcessBuilder("ln", "-s", target.absolutePath, link.absolutePath).start().waitFor()
        }
    }

    val sysPlatform = systemSdk.resolve("platforms/android-37.0")
    val localPlatform = localSdk.resolve("platforms/android-37")
    if (sysPlatform.exists()) {
        localPlatform.mkdirs()
        sysPlatform.listFiles()?.forEach { file ->
            val dest = localPlatform.resolve(file.name)
            if (file.name == "source.properties" || file.name == "package.xml") {
                dest.writeText(
                    file.readText()
                        .replace("AndroidVersion.ApiLevel=37.0", "AndroidVersion.ApiLevel=37")
                        .replace("platforms;android-37.0", "platforms;android-37")
                        .replace("<api-level>37.0</api-level>", "<api-level>37</api-level>")
                )
            } else if (!dest.exists()) {
                ProcessBuilder("ln", "-s", file.absolutePath, dest.absolutePath).start().waitFor()
            }
        }
    }
}

bootstrapLocalAndroidSdk(rootDir)

rootProject.name = "LawnTrackerCompose"
include(":app")
