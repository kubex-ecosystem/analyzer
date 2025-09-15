
# Guia do Super Usuário (o humano oreia mais brabo)

Você liga/desliga providers, injeta BYOK, exporta seu perfil, e compara custo/latência **sem pedir bênção pra ninguém**.

## Loadouts

* **Gemini Direct** (local e leve)
* **Gateway OpenAI** (usage + quotas)
* **Gateway Anthropic** (razão forte)
* **Gateway Groq** (latência absurda)

## Dicas

* Mude provider/model sem rebuild (menu).
* Ative “gateway mode” pra auditar tool calls sensíveis.
* Exporte o estado (1 clique) e reimporte em outra máquina: seu setup vai junto.

## Bench caseiro

* `gemx chat -m "N tokens por segundo?" --provider groq`
* Compare com OpenAI/Anthropic; escolha por caso de uso, não por hype.
