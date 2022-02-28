const { exec } = require('child_process')
const fs = require('fs');
const term = require('terminal-kit').terminal;

term.clear()

let termwidthline = '';

for (let i = 0; i < term.width; i++) {
	termwidthline += '━';
}

const download = async (url, callback) => {
    exec(`yt-dlp -f 'ba' -x --audio-format mp3 ${url} -o './downloaded/%(title)s.%(ext)s' -j --no-simulate --no-progress --embed-metadata`, (error, stdout, stderr) => {
		if (error) {
			console.log(`\nerror: ${error.message}`);
			return process.exit();
		}
		if (stderr) {
			console.log(`\nstderr: ${stderr}`);
			return process.exit();
		}
		const jsonDump = JSON.parse(stdout)

		fs.writeFile(`./jsondumps/${jsonDump.title} - ${jsonDump.uploader}.json`, JSON.stringify(jsonDump, null, 4), (err) => {
			if (err) throw err;
		})

		let fileLocation = jsonDump.filename.replace('.webm', '.mp3')

		callback(fileLocation)
	});
};

// download('https://www.youtube.com/watch?v=S5mpkBsrIpI')

const start = async () => {
	term.clear()
	term.cyan(termwidthline)
	term.singleColumnMenu(['Player Manager', 'Queue', 'Download', 'Exit'], async function(error, response) {
		if(response.selectedIndex === 0) player();
		else if(response.selectedIndex === 1) queue();
		else if(response.selectedIndex === 2) downloader();
		else if(response.selectedIndex === 3) process.exit();
	});
}

const player = async (selected) => {
	term.clear()
	term.cyan(termwidthline)
	if(!selected) selected = 0

	term.singleLineMenu(['Previous', 'Play/Pause', 'Stop', 'Next', 'Main Menu'], { selectedIndex: selected, selectedStyle: term }, async function(error, response) {
		if(response.selectedIndex === 0) { // Previous
			exec(`clementine -r`, (error, stdout, stderr) => {
				if (error) {
					console.log(`error: ${error.message}`);
					return process.exit();
				}
				if (stderr) {
					console.log(`stderr: ${stderr}`);
					return process.exit();
				}
				player(0)
			});
		}
		else if(response.selectedIndex === 1) { // Play/Pause
			exec(`clementine -t`, (error, stdout, stderr) => {
				if (error) {
					console.log(`error: ${error.message}`);
					return process.exit();
				}
				if (stderr) {
					console.log(`stderr: ${stderr}`);
					return process.exit();
				}
				player(1)
			});
		}
		else if(response.selectedIndex === 2) { // Stop
			exec(`clementine -s`, (error, stdout, stderr) => {
				if (error) {
					console.log(`error: ${error.message}`);
					return process.exit();
				}
				if (stderr) {
					console.log(`stderr: ${stderr}`);
					return process.exit();
				}
				player(2)
			});
		}
		else if(response.selectedIndex === 3) { // Start
			exec(`clementine -f`, (error, stdout, stderr) => {
				if (error) {
					console.log(`error: ${error.message}`);
					return process.exit();
				}
				if (stderr) {
					console.log(`stderr: ${stderr}`);
					return process.exit();
				}
				player(3)
			});
		}
		else if(response.selectedIndex === 4) { // Main Menu
			start()
		}
	});
}

const playSongFromLocation = async () => {
	term.clear()
	term.cyan(termwidthline)
	term.white('Choose your file\n')
	term.fileInput(
		{ baseDir: './' },
		function(error, input ) {
			if (error)
			{
				term.red.bold("\nAn error occurs: " + error + "\n");
				process.exit()
			}
			else
			{
				exec(`clementine -p "${input}"`, (error, stdout, stderr) => {
					if (error) {
						console.log(`error: ${error.message}`);
						return process.exit();
					}
					if (stderr) {
						console.log(`stderr: ${stderr}`);
						return process.exit();
					}
				});
				term.clear()
				term.cyan(termwidthline)
				term.white('Done!')
				term.singleColumnMenu(['Ok'], function(error, response) {
					start()
				});
			}
		}
	) ;
}

const playSongFromURL = async () => {
	term.clear()
	term.cyan(termwidthline)
	term.white('URL of audio you want to download?\n')

	term.inputField({}, async function(error, input) {
		term('\n')
		term.white('Downloading...')
		await download(input, function(outputLocation) {
			exec(`clementine -a "${outputLocation}"`, (error, stdout, stderr) => {
				if (error) {
					console.log(`error: ${error.message}`);
					return process.exit();
				}
				if (stderr) {
					console.log(`stderr: ${stderr}`);
					return process.exit();
				}
			});
			term.clear()
			term.cyan(termwidthline)
			term.white('Done!')
			term.singleColumnMenu(['Ok'], function(error, response) {
				start()
			});
		  })
		}
	);
}

const queue = async () => {
	term.clear()
	term.cyan(termwidthline)
	term.white('Queue from URL or from file?\n')
	term.singleColumnMenu(['URL', 'File', 'Back'], async function(error, response) {
		if(response.selectedIndex === 0) playSongFromURL();
		else if(response.selectedIndex === 1) playSongFromLocation();
		else if(response.selectedIndex === 2) start();
	});
}

const downloader = async () => {
	term.clear()
	term.cyan(termwidthline)
	term.white('URL of audio you want to download?\n')

	term.inputField({}, async function(error, input) {
		term('\n')
		term.white('Downloading...')
		await download(input, function() {
			term.clear()
			term.cyan(termwidthline)
			term.white('Done!')
			term.singleColumnMenu(['Ok'], function(error, response) {
				start()
			});
		  })
		}
	);
}

start()