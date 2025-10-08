{ pkgs, ... }: {
  channel = "stable-24.05";

  packages = [
    pkgs.nodejs_20
    pkgs.nodePackages.npm
  ];

  env = {
    # Optional: Default-Port für deine Next.js App
    PORT = "9002";
  };

  idx = {
    extensions = [
      # "vscodevim.vim"
    ];

    previews = {
      enable = true;
      previews = {
        web = {
          # Startbefehl für Next.js
          command = ["npm" "run" "dev"];
          manager = "web";
          env = {
            PORT = "$PORT";
          };
        };
      };
    };

    workspace = {
      onCreate = {
        # Automatisch Dependencies installieren beim Erstellen
        npm-install = "npm install";
      };
      onStart = {
        # Server automatisch starten beim Start
        dev-server = "npm run dev";
      };
    };
  };
}