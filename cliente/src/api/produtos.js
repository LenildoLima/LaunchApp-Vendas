import supabase from './supabaseClient'

// Listar todos os produtos ativos
export async function getProdutos() {
  try {
    const { data, error } = await supabase
      .from('produtos')
      .select(`
        id,
        nome,
        descricao,
        preco,
        preco_promocional,
        imagem_url,
        quantidade_estoque,
        ativo,
        categorias (id, nome)
      `)
      .order('nome')

    if (error) {
      console.error('Erro ao buscar produtos:', error)
      return { data: [], error }
    }
    
    return { data: data || [], error: null }
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
    return { data: [], error }
  }
}

// Buscar produto por ID
export async function getProdutoById(id) {
  try {
    const { data, error } = await supabase
      .from('produtos')
      .select('id, nome, descricao, preco, preco_promocional, imagem_url, quantidade_estoque, ativo, categorias (id, nome)')
      .eq('id', id)
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Erro ao buscar produto:', error)
    return { data: null, error }
  }
}

// Buscar produtos com filtro
export async function searchProdutos({ termo = '', minPreco = 0, maxPreco = 999999, categoriaId = null }) {
  try {
    let query = supabase
      .from('produtos')
      .select('id, nome, descricao, preco, preco_promocional, imagem_url, quantidade_estoque, ativo, categorias (id, nome)')
      .gte('preco', minPreco)
      .lte('preco', maxPreco)

    if (termo) {
      query = query.or(`nome.ilike.%${termo}%,descricao.ilike.%${termo}%`)
    }

    if (categoriaId) {
      query = query.eq('categoria_id', categoriaId)
    }

    const { data, error } = await query.order('nome')

    if (error) throw error
    return { data: data || [], error: null }
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
    return { data: [], error }
  }
}

// Listar categorias
export async function getCategorias() {
  try {
    const { data, error } = await supabase
      .from('categorias')
      .select('id, nome')
      .order('nome')

    if (error) throw error
    return { data: data || [], error: null }
  } catch (error) {
    console.error('Erro ao buscar categorias:', error)
    return { data: [], error }
  }
}

export default {
  getProdutos,
  getProdutoById,
  searchProdutos,
  getCategorias
}
