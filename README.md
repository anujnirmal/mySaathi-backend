# MySaathi Server
This server is handles incoming and outgoing data for the mySathi mobile app and admin dashboard

 
## Tech Stack  
* Node.js - Runtime for the server
* Express - package used to speed up server development
* Prisma - ORM used to communicate and migrate to Posgresql dashboard
* JWT - For authenticating user


## Run Locally  
Clone the project  

~~~bash  
  git clone https://github.com/anujnirmal/mySaathi-backend.git
~~~

Go to the project directory  

~~~bash  
  cd mySaathi-backend
~~~

Install dependencies  

~~~bash  
npm install
~~~

Start the dev server  

~~~bash  
npm run dev
~~~  
 
 
# Terminology  
* **Dashboard User** - It refers to the admin and super admin with access to dashboard
* **Members** - It refers to the end users, in this case these people will be accessing the services through android and ios app

  
# Server Features  
This section describes some features and services that this backend server offers

#### Roles 
There are two roles available, one **ADMIN** & **SUPERADMIN**, here the Admin is limited to perform limited actions only, whereas the SuperAdmin can perform all operations such as deletion, creation of other SuperAdmin users

#### Authentication - Dashboard user/admin
* Admin can log in through web browser
* Admin role are restricted to perform only certain access

#### Authentication - Members
* Members can only login through mobile app, IOS or Android
* One members can login to "n" number of devices ***Limiting the number of devices in which users can login needs to be discussed***


#### News 
* Dashboard user can create a news

endpoint: To be added
~~~javascript  
  {
	"title": "Hello there",
	"body": "Hello world",
	"image_url": "https://google.come",
	"news_url": "google.com"
}
~~~  
