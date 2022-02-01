import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("bot");

  const config = new DocumentBuilder()
    .setTitle("Bot API")
    .setVersion("1.0")
    .setDescription("Simple implementation of API for 'Botodachi' bot")
    .setLicense(
      "MIT",
      "https://github.com/YushchenkoAndrew/botodachi/blob/master/LICENSE",
    )
    .setContact(
      "API Author",
      "https://mortis-grimreaper.ddns.net/projects",
      "AndrewYushchenko@gmail.com",
    )
    .addBearerAuth(
      { type: "apiKey", name: "key", in: "query" },
      "Authorization",
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("bot/docs", app, document);

  await app.listen(3000);
}
bootstrap();
