This project is intended to be run inside WSL within windows. It probably works on linx/osx but the copy may not be useful so just disable it in the environment

# Important

I recommend running the first time with your g61 agent turned off so you dont accidentally delete your folder and sync it if things go wrong.

Make a backup of your setups directory

### Dependencies

- node
- npm

### Run instructions

1. `npm install`
2. Copy `.envexample` to `.env` and fill it in
3. `npm run start` (build and start)

### Notes:

1. Currently doesnt pagination the setups list, so I would recommend limiting to only a single season and single week at a time.
2. Only GT3 cars currently have a mapping from p1doks car name > iracing setup name.. So only gt3 cars will correctly sync unless you add it to `./src/mappers.ts`
