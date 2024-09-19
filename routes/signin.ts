import express from "express";
import Bot from "ROOT";

export default express.Router().get( "/", async ( req, res ) => {
	const qq: number = parseInt( <string>req.query.qq );
	const data = await Bot.redis.getString( `adachi.miHoYo.signIn.${ qq }` );
	res.send( JSON.parse( data ) );
} );