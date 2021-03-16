# MoveMed Server
## Your movement medicine.

---

[View the live MoveMed app here](https://move-med.vercel.app/)

[View the MoveMed server repo here](https://github.com/jenna-chestnut/move-med-server)

**MoveMed** was created with continuous movement in mind!

How you move (and how often you move) can make all the difference in your wellness, especially when it's at the direction of a professional.  
As true as this is, it can be hard to remember what exercises you were given, or how often you should do them - and sometimes, when you're at home and something happens during an exercise - you can forget to mention it in your visit!  

With MoveMed, the communication between provider and client is not broken after leaving the office.  
Providers can create exercises, and assign those exercises with unique details to a client. They can also assign a specific goal to the client - to help them stay motivated and on track. Clients can then view their goal and customized exercises anytime, without having to find a folded up paper or searching through their email. Comments between providers and the client help add feedback in real time and maintain progress.

 --- 

### Tech stack  
This server-side app was created with:    
<img align="left" alt="Visual Studio Code" width="26px" src="https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/visual-studio-code/visual-studio-code.png" />
<img align="left" alt="JavaScript" src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />
<img align="left" alt="NodeJS" src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" />
<img align="left" alt="ExpressJS" src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge" />
<img align="left" alt="Heroku" src="https://img.shields.io/badge/Heroku-430098?style=for-the-badge&logo=heroku&logoColor=white" />
<img align="left" alt="Git" width="26px" src="https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/git/git.png" />
<img align="left" alt="GitHub" width="26px" src="https://raw.githubusercontent.com/github/explore/78df643247d429f6cc873026c0622819ad797942/topics/github/github.png" />  

<br/>

---

### Endpoints Tree
**App🔻**     

➖**MiddleWare Used🔻**   
➖➖*Auth-Router w JWT* 
➖➖*Restricted Access*

➖**Routes🔻**    
➖**BASE URL: /api**

/ EXERCISE ENDPOINTS /
➖➖*/exercises*
(GET, POST)
➖➖*/exercises/:ex_id*
(GET, PATCH, DELETE)


/ CLIENT ENDPOINTS /
➖➖*/clients*
(GET)
➖➖*/clients/:client_id*
(GET)

/ CLIENT MANAGAMENT ENDPOINTS /
➖➖*/client-mgmt/goal*
(POST)
➖➖*/client-mgmt/goal/:user_id*
(GET, PATCH, DELETE)
➖➖*/client-mgmt/exercises/:user_ex_id*
(GET, PATCH, DELETE)
➖➖*/client-mgmt/exercises/:user_id*
(POST)

/ COMMENTS ENDPOINTS /
➖➖*/comments/:user_ex_id*
(GET, POST)
➖➖*/comments/:comment_id*
(PATCH, DELETE)

➖➖*/auth/login*  
➖➖*/auth/register*   
(POST)

➖➖*/users/*
(GET)

➖➖*/users/:user_id*
(GET, PATCH, DELETE)

  
---  
  
  
## Available Scripts  
  
In the project directory, you can run:  
  
`npm start`  
  
The page will reload if you make edits.\
You will also see any lint errors in the console.

`npm test`

Launches the test runner in the interactive watch mode.

`npm run dev`

Runs the app through a development server.

`npm run migrate`

Migrate tables in local database

`npm run migrate:test`

Migrate tables in local test database

`heroku create` to create remote server (will need heroku account - see this link for info https://devcenter.heroku.com/categories/command-line)  
  
`npm run deploy`  to:
  
- Run NPM audit  
- Migrate tables in production server
- Push latest commit to Heroku main branch of created app
