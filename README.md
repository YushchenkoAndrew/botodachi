# Botodachi

## A simple bot Server used as for creating dynamic cron jobs & microservices log collector & Discord bot

This microservice project is a **Part 4** of **'Web-Based Project Management System'**. 
 * [Part 1 'WEB Server'](https://github.com/YushchenkoAndrew/mortis-grimreaper)
 * [Part 2 'API Server'](https://github.com/YushchenkoAndrew/grape)
 * [Part 3 'File Server'](https://github.com/YushchenkoAndrew/void)
 * [Part 4 'bot'](https://github.com/YushchenkoAndrew/botodachi)

![System](/img/System.jpg)

So I guess you wondering, why I called it *'botodachi'*. Ehh, you know, 'bot' + 'tomodachi' => 'botodachi'. This one is quite simple

Anyway, this project is a log collector for whole microservice system **'Web-Based Project Management System'**, plus it has some useful features such as CRUD for *cron-jobs*


Basic summary:
* *discord-bot*
  * /ping - Simple ping/pong request
  * /web cache-run - Execute specific command directly at **WEB Server** Redis
  * /api cache-run - Execute specific command directly at **API Server** Redis
  * /api get-all [name] - Show a response from **API Server**


*(More information about routes you can find with swagger docs: http://127.0.0.1:3000/bot/docs)*

## Diagram
![Diagram](/img/botodachi.jpg)

## Cron job life cycle
![cron](/img/cron.jpg)

## How to use this project
1. Clone this repo
2. Copy .env.template to .env
```
cp .env.template .env
```
3. Configure a .env
4. Start the project
```
npm run start:dev
```


Now you can check if api is started by sending a **GET** request to http://localhost:3000/bot/ping

Swagger docs about routes you can find at http://127.0.0.1:31337/api/swagger/index.html

## Found a bug ?
Found something strange or just want to improve this project, just send a PR.

## What's not implemented yet / Known issues
- [ ] Project test coverage 
- [ ] Finish impl of *[In progress]* logic