const fs = require("fs");
const path = require("path");

const createProductionPackage = () => {
  const packageJsonPath = path.join(__dirname, "../package.json");
  const productionPackageJsonPath = path.join(
    __dirname,
    "../package.prod.json"
  );

  // Read the original package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

  // Create production version with only necessary dependencies
  const productionPackage = {
    name: packageJson.name,
    version: packageJson.version,
    description: packageJson.description,
    main: packageJson.main,
    dependencies: {
      // Only include the core package dependency
      "@iracing-setup-downloader/p1doks-download":
        packageJson.dependencies["@iracing-setup-downloader/p1doks-download"],
    },
    // Remove all devDependencies, scripts, and build config
    // This will be used during the build process
  };

  // Write the production package.json
  fs.writeFileSync(
    productionPackageJsonPath,
    JSON.stringify(productionPackage, null, 2)
  );

  console.log("Created production package.json");
};

createProductionPackage();
