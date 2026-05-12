/**
 * Utilitário para geração de Payload PIX (BR Code) Estático
 * Versão corrigida para máxima compatibilidade com apps bancários.
 */

function crc16(str: string): string {
  let crc = 0xFFFF;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
      crc &= 0xFFFF;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function formatField(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

/**
 * Remove acentos e caracteres especiais, mantendo apenas letras, números e espaços simples.
 */
function sanitizeString(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9 ]/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

export function gerarPayloadPix(params: {
  chave: string;
  valor: number;
  nome: string;
  cidade?: string;
  txid?: string;
}) {
  const { 
    chave, 
    valor, 
    nome, 
    cidade = "SAO PAULO", 
    txid = "***" 
  } = params;

  // 00: Payload Format Indicator
  let payload = "000201";
  
  // 26: Merchant Account Information
  const gui = "0014br.gov.bcb.pix";
  
  // Limpa a chave: remove espaços
  const cleanChave = chave.replace(/\s+/g, "");
  
  const keyField = formatField("01", cleanChave);
  payload += formatField("26", gui + keyField);

  // 52: Merchant Category Code
  payload += "52040000";
  
  // 53: Transaction Currency (986 = BRL)
  payload += "5303986";
  
  // 54: Transaction Amount
  const valorStr = valor.toFixed(2);
  payload += formatField("54", valorStr);

  // 58: Country Code
  payload += "5802BR";

  // 59: Merchant Name
  const cleanNome = sanitizeString(nome).substring(0, 25) || "LOJA";
  payload += formatField("59", cleanNome);

  // 60: Merchant City
  const cleanCidade = sanitizeString(cidade).substring(0, 15) || "CIDADE";
  payload += formatField("60", cleanCidade);

  // 62: Additional Data Field Template (TXID)
  // Alguns bancos (Inter) podem rejeitar códigos com TXID '***'. 
  // O padrão BCB permite omitir o campo 62 em Pix Estático se não houver TXID.
  if (txid && txid !== "***") {
    const cleanTxid = txid.replace(/[^A-Z0-9]/gi, "").substring(0, 25);
    if (cleanTxid) {
       payload += formatField("62", formatField("05", cleanTxid));
    }
  }

  // 63: CRC16
  payload += "6304";
  payload += crc16(payload);

  console.log("PIX Payload:", payload);
  return payload;
}
