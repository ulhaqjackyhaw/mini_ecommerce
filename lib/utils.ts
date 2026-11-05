export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCurrencyIDR(amount: number): string {
  const formatted = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  return `IDR ${formatted}`;
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (isNaN(diffInSeconds)) return dateString;

    if (diffInSeconds <= 30) {
      return 'Baru saja';
    }
    if (diffInSeconds < 60) {
      return `${diffInSeconds} detik yang lalu`;
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} menit yang lalu`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} jam yang lalu`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) {
      return '1 hari yang lalu';
    }
    if (diffInDays < 30) {
      return `${diffInDays} hari yang lalu`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths === 1) {
      return '1 bulan yang lalu';
    }
    if (diffInMonths < 12) {
      return `${diffInMonths} bulan yang lalu`;
    }

    const diffInYears = Math.floor(diffInDays / 365);
    if (diffInYears === 1) {
      return '1 tahun yang lalu';
    }
    return `${diffInYears} tahun yang lalu`;
  } catch {
    return dateString;
  }
}


