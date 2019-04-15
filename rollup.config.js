import babel from 'rollup-plugin-babel';
import { uglify } from "rollup-plugin-uglify";

export default {
	input: './src/index.ts',
	plugins: [
		babel({ extensions: ['.ts', 'tsx'], exclude: ['dist/**', 'node_modules/**'] }),
		uglify(),
	],
	output: {
		file: './dist/index.js',
		format: 'umd',
		name: 'cdst'
	}
};
