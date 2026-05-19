#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Travello — First-time Server Setup Script
# Target: Ubuntu 22.04 LTS on Azure VM
# Run once as a sudo-capable user.
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

echo "======================================================="
echo "  Travello — Production Setup"
echo "======================================================="

# ── 1. System update ─────────────────────────────────────────────────────────
echo "[1/6] Updating system packages..."
sudo apt-get update && sudo apt-get upgrade -y

# ── 2. Install Docker ────────────────────────────────────────────────────────
echo "[2/6] Installing Docker..."
sudo apt-get install -y ca-certificates curl gnupg lsb-release

sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Allow current user to run docker without sudo
sudo usermod -aG docker "$USER"
echo "ℹ️  Docker installed. You may need to re-login for group changes to take effect."

# ── 3. Install Nginx ─────────────────────────────────────────────────────────
echo "[3/6] Installing Nginx..."
sudo apt-get install -y nginx

# ── 4. Install Certbot (SSL) ─────────────────────────────────────────────────
echo "[4/6] Installing Certbot for SSL..."
sudo apt-get install -y certbot python3-certbot-nginx

# ── 5. Configure Firewall ────────────────────────────────────────────────────
echo "[5/6] Configuring UFW firewall..."
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw allow 3000/tcp    # Frontend container (if exposing directly)
sudo ufw --force enable

# ── 6. Create project directory ──────────────────────────────────────────────
echo "[6/6] Setting up project directory..."
mkdir -p ~/travello
echo ""
echo "======================================================="
echo "  Setup complete!"
echo ""
echo "  Next steps:"
echo "  1. git clone <your-repo> ~/travello"
echo "  2. cd ~/travello"
echo "  3. cp .env.example .env && nano .env   # Fill in real values"
echo "  4. bash deploy/deploy.sh"
echo "======================================================="
