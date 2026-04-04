from pathlib import Path

import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt
from matplotlib.patches import FancyArrowPatch


OUTPUT_PATH = Path(__file__).with_name("brownian-roadmap.png")


def add_arrow(ax, start, end, label=None, offset=(0.0, 0.0), fs=13):
    arrow = FancyArrowPatch(
        start,
        end,
        arrowstyle="-|>",
        mutation_scale=18,
        linewidth=2.0,
        color="#D8D8D8",
        connectionstyle="arc3,rad=0.0",
    )
    ax.add_patch(arrow)
    if label:
        mx = (start[0] + end[0]) / 2 + offset[0]
        my = (start[1] + end[1]) / 2 + offset[1]
        ax.text(
            mx,
            my,
            label,
            ha="center",
            va="center",
            fontsize=fs,
            color="#F2F2F2",
            bbox=dict(boxstyle="round,pad=0.16", facecolor="#3A3B40", edgecolor="none"),
        )


def main():
    plt.rcParams["font.family"] = ["Malgun Gothic", "DejaVu Sans"]
    plt.rcParams["mathtext.fontset"] = "stix"

    fig, ax = plt.subplots(figsize=(12.5, 7.6), facecolor="#1E1F22")
    ax.set_facecolor("#1E1F22")
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis("off")

    ax.text(0.50, 0.90, "Brownian motion", ha="center", va="center", fontsize=22, color="#F2F2F2")
    ax.text(0.50, 0.84, r"$W=(W_t)_{t\geq 0}$", ha="center", va="center", fontsize=24, color="#F2F2F2")

    ax.text(0.50, 0.56, r"$dX_t = b_t\,dt + \sigma_t\,dW_t$", ha="center", va="center", fontsize=30, color="#F2F2F2")

    ax.text(0.18, 0.72, "짧은 시간에서 보면", ha="center", va="center", fontsize=18, color="#F2F2F2")
    ax.text(0.18, 0.66, r"$\Delta W \sim N(0,\Delta t)$", ha="center", va="center", fontsize=22, color="#F2F2F2")

    ax.text(0.18, 0.40, "미분은 안 되지만", ha="center", va="center", fontsize=18, color="#F2F2F2")
    ax.text(0.18, 0.34, "제곱합은 남는다", ha="center", va="center", fontsize=18, color="#F2F2F2")
    ax.text(0.18, 0.27, r"$(\Delta W)^2$의 합 $\leadsto dt$", ha="center", va="center", fontsize=20, color="#F2F2F2")

    ax.text(0.82, 0.70, "예측 가능한", ha="center", va="center", fontsize=18, color="#F2F2F2")
    ax.text(0.82, 0.64, "방향성(drift)이 없다", ha="center", va="center", fontsize=18, color="#F2F2F2")

    ax.text(0.82, 0.40, "먼저", ha="center", va="center", fontsize=18, color="#F2F2F2")
    ax.text(0.82, 0.33, r"$\int H_t\,dW_t$", ha="center", va="center", fontsize=24, color="#F2F2F2")
    ax.text(0.82, 0.26, "를 정의한다", ha="center", va="center", fontsize=18, color="#F2F2F2")

    ax.text(0.20, 0.12, r"$b_t\,dt$ : drift 항", ha="center", va="center", fontsize=21, color="#F2F2F2")
    ax.text(0.77, 0.12, r"$\sigma_t\,dW_t$ : noise 항", ha="center", va="center", fontsize=21, color="#F2F2F2")

    add_arrow(ax, (0.46, 0.82), (0.24, 0.69), label="국소적으로 본다", offset=(-0.01, 0.03))
    add_arrow(ax, (0.24, 0.61), (0.42, 0.57), label=r"$dW$ 쪽을 읽는다", offset=(0.00, 0.03))
    add_arrow(ax, (0.20, 0.23), (0.47, 0.55), label=r"$dt$가 왜 생기는지 본다", offset=(0.03, 0.02))

    add_arrow(ax, (0.54, 0.82), (0.76, 0.67), label="drift가 없는지 본다", offset=(0.03, 0.03))
    add_arrow(ax, (0.78, 0.57), (0.72, 0.56), label=r"$dW$를 적분에 넣는다", offset=(0.07, 0.03))
    add_arrow(ax, (0.78, 0.22), (0.62, 0.56), label=r"$\sigma_t\,dW_t$", offset=(0.08, 0.02))
    add_arrow(ax, (0.26, 0.10), (0.40, 0.54), label=r"$b_t\,dt$", offset=(-0.02, 0.00))

    fig.tight_layout(pad=0)
    fig.savefig(OUTPUT_PATH, dpi=220, facecolor=fig.get_facecolor(), bbox_inches="tight")


if __name__ == "__main__":
    main()
