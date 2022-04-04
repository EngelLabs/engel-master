# Intro bullshit
Hi. This is an archived project that I've spent *a lot* of time on (without accomplishing much). I like finding random open source code online (I find them intriguing and even educational) and so I'm just making this repository public.

# Ok well what is it
A Discord bot. A very *very* incomplete one at that. I am not going to offer any explanation. I know, I suck.

# Setting it up
- You should have [NodeJS](https://nodejs.org/en/download/) set up. I used v17.6.0 for this project and can't verify whether any other versions are compatible.
- You should also have [MongoDB](https://www.mongodb.com/docs/manual/administration/install-community/) and [Redis](https://redis.io/download/) set up. Check these links for some assistance
- Check the [.env file example](./env-example) and fill in values as you see fit. It should be pretty self-explanatory.  
- Install `yarn` with `npm install -g yarn` or an alternative method.  
- Install dependencies by running `yarn`  
- Build the project with `yarn build`  
- Create a configuration for the current client state by running `yarn run config`  
- You can now run the project with `yarn bot` and `yarn web` to run the Discord bot and web server respectively.

# Basic list of yarn commands

`yarn lint`: Lint the project  
`yarn build`: Build the project  
`yarn clean`: Clean up already built code  
`yarn dev`: Run file watchers and stuff. Useful for a development environment
`yarn dev:bot` ^ Same description, but only for the Discord bot project  
`yarn dev:web` ^ Same stuff, but only for the web server project  
`yarn bot`: Run the Discord bot
`yarn web`: Run the web server

There's more listed in the actual [package.json](./package.json) file that you can look at if you want.