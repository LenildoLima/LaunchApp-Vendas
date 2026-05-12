import supabase from './supabaseClient'

// Gerar número único de pedido
async function gerarNumeroPedido() {
  const hoje = new Date()
  const dataStr = hoje.toISOString().split('T')[0].replace(/-/g, '')

  const { data, error } = await supabase
    .from('pedidos')
    .select('numero_pedido')
    .gte('criado_em', hoje.toISOString().split('T')[0])

  const contador = (data?.length || 0) + 1
  const numeroPadronizado = String(contador).padStart(3, '0')

  return `PED-${dataStr}-${numeroPadronizado}`
}

// Criar novo pedido
export async function createPedido(pedidoData, itens) {
  console.log('🔴 INICIANDO createPedido com:', pedidoData.forma_pagamento);
  
  try {
    // 1. Gera número único
    const numeroPedido = await gerarNumeroPedido()
    console.log('✅ Número gerado:', numeroPedido);

    // 2. Busca o ID da forma de pagamento pelo nome
    console.log('🔍 Buscando forma_pagamento...');
    const { data: formaPago, error: erroForm } = await supabase
      .from('formas_pagamento')
      .select('id')
      .eq('nome', pedidoData.forma_pagamento)
      .single()

    console.log('📊 Resultado forma_pagamento:', { formaPago, erroForm });

    if (erroForm) {
      console.error('Erro ao buscar forma pagamento:', erroForm);
      throw erroForm;
    }

    const formaPagamentoId = formaPago.id

    // 3. Insere o pedido
    const { data: novoPedido, error: erroInsertPedido } = await supabase
      .from('pedidos')
      .insert([{
        numero_pedido: numeroPedido,
        cliente_id: pedidoData.cliente_id,
        observacoes_cliente: pedidoData.observacoes || '',
        status: 'Pendente',
        subtotal: pedidoData.subtotal || 0,
        taxa_entrega: 0,
        desconto: 0,
        total: pedidoData.total || 0,
        forma_pagamento: pedidoData.forma_pagamento, // Mantém backup em string
        metodo_pagamento: pedidoData.forma_pagamento, // Backup legacy
        forma_pagamento_id: formaPagamentoId, // NOVO: FK
        status_pagamento: 'Pendente',
        pagamento_confirmado: pedidoData.pagamento_confirmado || false,
        criado_em: new Date().toISOString()
      }])
      .select('id, numero_pedido, criado_em')
      .single()

    if (erroInsertPedido) throw erroInsertPedido

    // 3. Insere os itens do pedido
    const itensComPedidoId = itens.map(item => ({
      pedido_id: novoPedido.id,
      produto_id: item.produto_id,
      quantidade: item.quantidade,
      preco_unitario: item.preco_unitario,
      subtotal: item.quantidade * item.preco_unitario
    }))

    const { error: erroInsertItens } = await supabase
      .from('itens_pedido')
      .insert(itensComPedidoId)

    if (erroInsertItens) throw erroInsertItens

    return { data: novoPedido, error: null }
  } catch (error) {
    console.error('Erro ao criar pedido:', error)
    return { data: null, error }
  }
}

// Listar pedidos (Admin)
export async function getPedidos(filtros = {}) {
  try {
    let query = supabase
      .from('pedidos')
      .select('*')

    if (filtros.status && filtros.status !== 'Todos') {
      query = query.eq('status', filtros.status)
    }

    const { data, error } = await query
      .order('criado_em', { ascending: false })

    if (error) throw error
    return { data: data || [], error: null }
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error)
    return { data: [], error }
  }
}

// Buscar pedido por ID
export async function getPedidoById(id) {
  try {
    const { data, error } = await supabase
      .from('pedidos')
      .select(`
        *,
        itens_pedido (
          id,
          quantidade,
          preco_unitario,
          subtotal,
          produtos (id, nome, imagem_url)
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Erro ao buscar pedido:', error)
    return { data: null, error }
  }
}

// Atualizar status do pedido
export async function updateStatusPedido(pedidoId, novoStatus) {
  try {
    const { data, error } = await supabase
      .from('pedidos')
      .update({
        status: novoStatus,
        atualizado_em: new Date().toISOString()
      })
      .eq('id', pedidoId)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Erro ao atualizar status:', error)
    return { data: null, error }
  }
}

export default {
  createPedido,
  getPedidos,
  getPedidoById,
  updateStatusPedido
}
