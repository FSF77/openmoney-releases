# OpenMoney - Canal Oficial de Atualizações e Downloads

Repositório público de distribuição e feed de atualização automática do **OpenMoney** para macOS.

---

## ⚡ Última Versão Disponível: **v2.3.0** (Build 115)
> *Publicada em: 06/11/2026 às 21:22*

| Arquivo | Descrição | Link Direto | Tamanho |
| :--- | :--- | :--- | :--- |
| **OpenMoney-2.3.0.zip** | Pacote oficial v2.3.0 para macOS | [📥 Download v2.3.0](https://github.com/FSF77/openmoney-releases/raw/main/downloads/OpenMoney-2.3.0.zip) | ~5 MB |
| **version.json** | Feed de verificação automática | [🔍 Visualizar](https://raw.githubusercontent.com/FSF77/openmoney-releases/main/version.json) | < 1 KB |

### 🔐 Integridade (SHA256)
```
699f90e0c25906a431c72581829e5f38cfcdf74776d4449f8857d4c67543ef06  OpenMoney-2.3.0.zip
```

### 📝 Notas desta Versão
Liberado a opção para sincronização online, seus dados estão seguros com login e senha, uso de criptografia AES-256-GCM + PBKDF2, versão web em https://openmoney.app.br , aplicação e base hospedados na Cloudflare, é possível incluir comentários no fluxo na última linha (saldo final cumulado)

---

## 💻 Como Instalar no macOS

### Opção 1: Instalação Automática (Recomendada)
Para instalar ou atualizar com 1 comando pelo Terminal (sem avisos do Gatekeeper):
```bash
curl -fsSL https://raw.githubusercontent.com/FSF77/openmoney-releases/main/install.sh | bash
```

### Opção 2: Download Manual
1. Baixe o pacote [OpenMoney-2.3.0.zip](https://github.com/FSF77/openmoney-releases/raw/main/downloads/OpenMoney-2.3.0.zip).
2. Dê dois cliques para descompactar o `OpenMoney.app`.
3. Arraste para a pasta **/Applications**.
4. **Se o macOS exibir o aviso:** *"OpenMoney está danificado e não pode ser aberto"*
   > Esse é o comportamento padrão do macOS Gatekeeper para aplicativos distribuídos fora da Mac App Store sem certificado corporativo anual da Apple.
   
   Para liberar, basta abrir o **Terminal** e executar:
   ```bash
   xattr -cr /Applications/OpenMoney.app
   ```
   *(Ou clique com o botão direito / Control-clique no aplicativo > **Abrir** > confirmar **Abrir**).*

5. A partir de então, todas as próximas atualizações serão instaladas diretamente pelo próprio aplicativo no menu **OpenMoney > Buscar Atualizações...**.
