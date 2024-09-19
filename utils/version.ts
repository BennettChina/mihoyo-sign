import Bot from "ROOT";
import { isJsonString } from "@/utils/verify";
import { PresetPlace } from "@/modules/file";

export function getRootVersion(): string {
	return getVersion( "package.json", "root" );
}

export function getThisVersion(): string {
	return getVersion( "mihoyo-sign/package.json", "plugin" );
}

function getVersion( referencePath: string, place: PresetPlace ): string {
	const path: string = Bot.file.getFilePath( referencePath, place );
	const packageFile = Bot.file.loadFile( path );
	const version = isJsonString( packageFile ) ? JSON.parse( packageFile ).version || "" : "";
	return version.split( "-" )[0];
}